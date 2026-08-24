#!/usr/bin/env node

// Installs an image that already lives in Vercel Blob as a trip's cover:
//   pnpm trip:cover -- --image trips/composites/<lumaId>.jpg --trip 2026/boston
// Fetches the source blob, converts PNG to JPEG if needed (sips), and
// overwrites trips/{year}/{slug}/photos/cover.jpg. No local file sources.

import { execFile } from 'node:child_process'
import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createInterface } from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import { list, put } from '@vercel/blob'

const execFileAsync = promisify(execFile)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')
const defaultBlobBaseUrl = 'https://avswwi5vtnxsddjy.public.blob.vercel-storage.com'
const tripPattern = /^\d{4}\/[a-z0-9_]+$/

function parseArgs(argv) {
  const args = {
    image: '',
    trip: '',
    dryRun: false,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index]

    // pnpm forwards the "--" separator literally; ignore it.
    if (token === '--') {
      continue
    }

    if (token === '--dry-run') {
      args.dryRun = true
      continue
    }

    if (token === '--image') {
      args.image = argv[index + 1] ?? ''
      index += 1
      continue
    }

    if (token === '--trip') {
      args.trip = argv[index + 1] ?? ''
      index += 1
      continue
    }

    throw new Error(`Unsupported argument: ${token}. Supported: --image, --trip, --dry-run.`)
  }

  return args
}

async function readEnvFile(filePath) {
  try {
    const contents = await fs.readFile(filePath, 'utf8')
    const lines = contents.split(/\r?\n/)

    for (const line of lines) {
      const trimmed = line.trim()

      if (!trimmed || trimmed.startsWith('#')) {
        continue
      }

      const separatorIndex = trimmed.indexOf('=')

      if (separatorIndex === -1) {
        continue
      }

      const key = trimmed.slice(0, separatorIndex).trim()
      const rawValue = trimmed.slice(separatorIndex + 1).trim()

      if (!key || process.env[key]) {
        continue
      }

      const unquotedValue = rawValue.replace(/^['"]|['"]$/g, '')
      process.env[key] = unquotedValue
    }
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return
    }

    throw error
  }
}

async function loadEnvFiles() {
  await readEnvFile(path.join(repoRoot, '.env.local'))
  await readEnvFile(path.join(repoRoot, '.env'))
}

function logStep(message) {
  console.log(`\n[trip:cover] ${message}`)
}

async function promptText(rl, label, example) {
  const answer = (await rl.question(`${label} (example: ${example}): `)).trim()

  if (!answer) {
    throw new Error(`${label} is required`)
  }

  return answer
}

async function resolveInput(args) {
  let { image, trip } = args

  if (!image || !trip) {
    const rl = createInterface({ input, output })

    try {
      if (!image) {
        image = await promptText(rl, 'Source blob URL or pathname', 'trips/composites/<lumaId>.jpg')
      }

      if (!trip) {
        trip = await promptText(rl, 'Trip (year/slug)', '2026/boston')
      }
    } finally {
      rl.close()
    }
  }

  trip = trip.trim().replace(/^\/+|\/+$/g, '')

  if (!tripPattern.test(trip)) {
    throw new Error(`Invalid trip "${trip}". Use the form year/slug, e.g. 2026/boston.`)
  }

  return { image: image.trim(), trip }
}

/**
 * Only blobs already in this store are valid sources. A full URL must start
 * with the store's public origin; a bare pathname is resolved against it.
 */
function resolveSourceUrl(image, blobBaseUrl) {
  if (/^https?:\/\//i.test(image)) {
    if (!image.startsWith(`${blobBaseUrl}/`)) {
      throw new Error(`Image URL must be in this blob store (${blobBaseUrl}/...). Got: ${image}`)
    }

    return image
  }

  return `${blobBaseUrl}/${image.replace(/^\/+/, '')}`
}

async function fetchSourceBlob(sourceUrl) {
  logStep(`Fetching source image ${sourceUrl}`)
  const response = await fetch(sourceUrl)

  if (!response.ok) {
    throw new Error(`Image not found in blob storage (HTTP ${response.status}): ${sourceUrl}`)
  }

  const contentType = (response.headers.get('content-type') ?? '').toLowerCase()

  if (!contentType.startsWith('image/')) {
    throw new Error(`Source blob is not an image (content-type: ${contentType || 'unknown'})`)
  }

  return {
    buffer: Buffer.from(await response.arrayBuffer()),
    contentType,
  }
}

async function verifyTripPhotosPath(trip, token) {
  const prefix = `trips/${trip}/photos/`
  logStep(`Verifying trip photos path ${prefix}`)
  const existing = await list({ prefix, token })

  if (existing.blobs.length === 0) {
    throw new Error(`No blobs found under ${prefix} — check the trip year/slug.`)
  }
}

/** cover.jpg gets real JPEG bytes: PNG sources are converted via sips, JPEG passes through. */
async function ensureJpeg({ buffer, contentType, dryRun }) {
  if (contentType.includes('jpeg') || contentType.includes('jpg')) {
    return { buffer, converted: false }
  }

  if (!contentType.includes('png')) {
    throw new Error(`Unsupported source image type "${contentType}". Use a JPEG or PNG blob.`)
  }

  if (dryRun) {
    logStep('Dry run: would convert PNG -> JPEG with sips')
    return { buffer, converted: true }
  }

  logStep('Converting PNG -> JPEG with sips')
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'trip-cover-'))
  const pngPath = path.join(tempDir, 'source.png')
  const jpegPath = path.join(tempDir, 'cover.jpg')

  try {
    await fs.writeFile(pngPath, buffer)
    await execFileAsync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '90', pngPath, '--out', jpegPath])
    return { buffer: await fs.readFile(jpegPath), converted: true }
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true })
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))

  await loadEnvFiles()

  const token = process.env.ROBDLC_PERSONAL_WEBSITE_READ_WRITE_TOKEN

  if (!token) {
    throw new Error('Missing ROBDLC_PERSONAL_WEBSITE_READ_WRITE_TOKEN. Set it in your shell or .env.local.')
  }

  const blobBaseUrl = (process.env.BLOB_BASE_URL ?? defaultBlobBaseUrl).replace(/\/+$/, '')
  const { image, trip } = await resolveInput(args)
  const sourceUrl = resolveSourceUrl(image, blobBaseUrl)
  const coverPathname = `trips/${trip}/photos/cover.jpg`

  const source = await fetchSourceBlob(sourceUrl)
  await verifyTripPhotosPath(trip, token)
  const jpeg = await ensureJpeg({ ...source, dryRun: args.dryRun })

  if (args.dryRun) {
    logStep(`Dry run: would overwrite ${coverPathname} (${jpeg.buffer.byteLength} bytes fetched)`)
    console.log('\nDry run: no blobs were written')
    return
  }

  logStep(`Overwriting ${coverPathname}`)
  const result = await put(coverPathname, jpeg.buffer, {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'image/jpeg',
    token,
  })

  console.log('\nTrip cover updated')
  console.log(`- Source: ${sourceUrl}${jpeg.converted ? ' (converted PNG -> JPEG)' : ''}`)
  console.log(`- Cover: ${result.url}`)
  console.log('- Caches: Blob edge purge can take ~60s; locally hard refresh (Cmd+Shift+R) or rm -rf .next/cache')
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`Setting trip cover failed: ${message}`)
  process.exitCode = 1
})
