#!/usr/bin/env node

import { execFile } from 'node:child_process'
import { promises as fs } from 'node:fs'
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
const mediaRoot = path.join(repoRoot, 'media')
const tripMediaRoot = path.join(mediaRoot, 'trips')
const tripsIndexPath = path.join(mediaRoot, 'trips_index.json')
const defaultPhotoStagingRoot = '/Users/robertdelacruz/bin/website_photos'
const supportedPhotoExtensions = new Set(['.jpg', '.jpeg'])
const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const promptExamples = {
  year: '2025',
  month: 'October',
  slug: 'new_york',
  title: 'New York City',
  location: 'New York, USA',
  description: 'Exploring New York City and Brooklyn',
  tags: 'city,food',
  date: '2025-10-01',
  sourceDir: `${defaultPhotoStagingRoot}/new_york`,
}

function parseArgs(argv) {
  const args = {
    dryRun: false,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index]

    if (token === '--dry-run') {
      args.dryRun = true
      continue
    }

    throw new Error(`Unsupported argument: ${token}. Only --dry-run is supported.`)
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

function normalizeSlug(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_-]/g, '')
    .replace(/_+/g, '_')
    .replace(/^[_-]+|[_-]+$/g, '')
}

function normalizeMonth(value) {
  const trimmed = value.trim().toLowerCase()
  const match = monthNames.find((month) => month.toLowerCase() === trimmed)

  if (!match) {
    throw new Error(`Invalid month "${value}". Use the full month name.`)
  }

  return match
}

function assertDate(value, label) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`${label} must use yyyy-mm-dd format`)
  }
}

function toRelativeRepoPath(absolutePath) {
  return path.relative(repoRoot, absolutePath) || '.'
}

function logStep(message) {
  console.log(`\n[trip:onboard] ${message}`)
}

function compareTripsDescending(a, b) {
  if (a.year !== b.year) {
    return b.year - a.year
  }

  const monthA = new Date(`${a.month} 1, ${a.year}`).getTime()
  const monthB = new Date(`${b.month} 1, ${b.year}`).getTime()
  return monthB - monthA
}

async function ensureDirectoryExists(targetPath) {
  await fs.mkdir(targetPath, { recursive: true })
}

async function readJson(filePath) {
  const contents = await fs.readFile(filePath, 'utf8')
  return JSON.parse(contents)
}

async function promptText(rl, label, options = {}) {
  const { defaultValue = '', example = '', isRequired = true } = options
  let prompt = label

  if (example) {
    prompt += ` (example: ${example})`
  }

  if (defaultValue) {
    prompt += ` [default: ${defaultValue}]`
  }

  const answer = (await rl.question(`${prompt}: `)).trim()

  if (answer) {
    return answer
  }

  if (defaultValue) {
    return defaultValue
  }

  if (isRequired) {
    throw new Error(`${label} is required`)
  }

  return ''
}

async function promptForCover(rl, files) {
  console.log('\nAvailable JPG files:')
  files.forEach((file, index) => {
    console.log(`  ${index + 1}. ${path.basename(file)}`)
  })

  const rawAnswer = await rl.question('Choose cover image number [1]: ')
  const selectedIndex = rawAnswer.trim() ? Number(rawAnswer.trim()) - 1 : 0

  if (!Number.isInteger(selectedIndex) || selectedIndex < 0 || selectedIndex >= files.length) {
    throw new Error('Invalid cover selection')
  }

  return files[selectedIndex]
}

async function resolveTripInput() {
  const inputValues = {}
  const rl = createInterface({ input, output })

  try {
    inputValues.year = await promptText(rl, 'Trip year', {
      example: promptExamples.year,
    })
    inputValues.month = await promptText(rl, 'Trip month', {
      example: promptExamples.month,
    })
    inputValues.slug = normalizeSlug(
      await promptText(rl, 'Trip slug', {
        example: promptExamples.slug,
      }),
    )
    inputValues.title = await promptText(rl, 'Trip title', {
      example: promptExamples.title,
    })
    inputValues.location = await promptText(rl, 'Trip location', {
      example: promptExamples.location,
    })
    inputValues.description = await promptText(rl, 'Trip description', {
      example: promptExamples.description,
    })
    inputValues.start = await promptText(rl, 'Trip start date', {
      example: promptExamples.date,
    })
    inputValues.end = await promptText(rl, 'Trip end date', {
      example: promptExamples.date,
    })
    inputValues.tags = await promptText(rl, 'Trip tags (comma separated)', {
      example: promptExamples.tags,
      isRequired: false,
    })
    inputValues.sourceDir = await promptText(rl, 'Source photo directory', {
      example: promptExamples.sourceDir,
      defaultValue: path.join(defaultPhotoStagingRoot, inputValues.slug),
    })
  } finally {
    rl.close()
  }

  if (!inputValues.slug) {
    throw new Error('Trip slug cannot be empty after normalization')
  }

  inputValues.month = normalizeMonth(inputValues.month)
  inputValues.year = String(Number(inputValues.year))

  if (!/^\d{4}$/.test(inputValues.year)) {
    throw new Error('Trip year must be a 4-digit number')
  }

  assertDate(inputValues.start, 'Trip start date')
  assertDate(inputValues.end, 'Trip end date')

  if (new Date(inputValues.start).getTime() > new Date(inputValues.end).getTime()) {
    throw new Error('Trip start date cannot be after the end date')
  }

  const tags = inputValues.tags
    ? inputValues.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)
    : []

  return {
    year: Number(inputValues.year),
    month: inputValues.month,
    slug: inputValues.slug,
    title: inputValues.title.trim(),
    location: inputValues.location.trim(),
    description: inputValues.description.trim(),
    dateRange: {
      start: inputValues.start,
      end: inputValues.end,
    },
    tags,
    sourceDir: path.resolve(inputValues.sourceDir),
  }
}

async function resolvePhotoFiles(sourceDir) {
  const entries = await fs.readdir(sourceDir, { withFileTypes: true })
  const files = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right, undefined, { sensitivity: 'base' }))

  const heicFiles = files
    .filter((file) => /\.heic$/i.test(file))
    .map((file) => path.join(sourceDir, file))

  const jpgFiles = files
    .filter((file) => supportedPhotoExtensions.has(path.extname(file).toLowerCase()))
    .map((file) => path.join(sourceDir, file))

  return { heicFiles, jpgFiles }
}

async function convertHeicFiles(heicFiles, dryRun) {
  const convertedFiles = []

  if (heicFiles.length === 0) {
    logStep('No HEIC files found for conversion')
    return convertedFiles
  }

  for (const heicFile of heicFiles) {
    const destinationFile = heicFile.replace(/\.heic$/i, '.jpg')
    convertedFiles.push(destinationFile)

    if (dryRun) {
      logStep(`Dry run: would convert ${path.basename(heicFile)} -> ${path.basename(destinationFile)}`)
      continue
    }

    logStep(`Converting ${path.basename(heicFile)} -> ${path.basename(destinationFile)}`)
    await execFileAsync('sips', ['-s', 'format', 'jpeg', heicFile, '--out', destinationFile])
  }

  return convertedFiles
}

async function ensureCoverPhoto({ sourceDir, jpgFiles, dryRun }) {
  if (jpgFiles.length === 0) {
    throw new Error(`No JPG photos found in ${sourceDir}`)
  }

  const existingCover = jpgFiles.find((file) => path.basename(file).toLowerCase() === 'cover.jpg')

  if (existingCover) {
    logStep(`Using existing cover.jpg in ${sourceDir}`)
    return {
      coverPath: existingCover,
      createdCover: false,
      selectedSource: existingCover,
    }
  }

  let selectedSource = null

  if (!selectedSource) {
    const rl = createInterface({ input, output })

    try {
      selectedSource = await promptForCover(
        rl,
        jpgFiles.filter((file) => path.basename(file).toLowerCase() !== 'cover.jpg'),
      )
    } finally {
      rl.close()
    }
  }

  const coverPath = path.join(sourceDir, 'cover.jpg')

  if (path.resolve(selectedSource) === coverPath) {
    logStep(`Using ${path.basename(selectedSource)} as cover photo`)
    return {
      coverPath,
      createdCover: false,
      selectedSource,
    }
  }

  if (!dryRun) {
    logStep(`Creating cover.jpg from ${path.basename(selectedSource)}`)
    await fs.copyFile(selectedSource, coverPath)
  } else {
    logStep(`Dry run: would create cover.jpg from ${path.basename(selectedSource)}`)
  }

  return {
    coverPath,
    createdCover: true,
    selectedSource,
  }
}

function buildTripSummary(tripInput) {
  const photosPath = `trips/${tripInput.year}/${tripInput.slug}/photos`

  return {
    year: tripInput.year,
    month: tripInput.month,
    slug: tripInput.slug,
    title: tripInput.title,
    location: tripInput.location,
    description: tripInput.description,
    photosPath,
  }
}

function buildTripDetail(tripInput, tripSummary) {
  const tripDetail = {
    title: tripInput.title,
    slug: tripInput.slug,
    year: tripInput.year,
    month: tripInput.month,
    location: tripInput.location,
    description: tripInput.description,
    dateRange: {
      start: tripInput.dateRange.start,
      end: tripInput.dateRange.end,
    },
    photosPath: tripSummary.photosPath,
    heroPhoto: `${tripSummary.photosPath}/cover.jpg`,
  }

  if (tripInput.tags.length > 0) {
    tripDetail.tags = tripInput.tags
  }

  return tripDetail
}

function stringifyJson(data) {
  return `${JSON.stringify(data, null, 2)}\n`
}

async function verifyTripIsNew({ tripSummary, localTripsIndex, tripDetailFilePath, token }) {
  logStep(`Checking local media for ${tripSummary.year}/${tripSummary.slug}`)
  const localTripExists = localTripsIndex.some(
    (trip) => trip.year === tripSummary.year && trip.slug === tripSummary.slug,
  )
  const detailFileExists = await fs
    .access(tripDetailFilePath)
    .then(() => true)
    .catch(() => false)

  logStep(`Checking Vercel Blob for trips/${tripSummary.year}/${tripSummary.slug}/`)
  const existingBlobs = await list({
    prefix: `trips/${tripSummary.year}/${tripSummary.slug}/`,
    token,
  })
  const remoteTripExists = existingBlobs.blobs.length > 0

  if (localTripExists || detailFileExists || remoteTripExists) {
    throw new Error(
      `Trip ${tripSummary.year}/${tripSummary.slug} already exists locally or in blob storage. This script only supports onboarding new trips.`,
    )
  }
}

function upsertTripsIndex(tripsIndex, tripSummary) {
  const nextTrips = tripsIndex.filter(
    (trip) => !(trip.year === tripSummary.year && trip.slug === tripSummary.slug),
  )
  nextTrips.push(tripSummary)
  return nextTrips.sort(compareTripsDescending)
}

async function writeLocalFiles({ tripDirectory, tripDetailFilePath, tripDetailJson, tripsIndexJson, dryRun }) {
  if (dryRun) {
    logStep(`Dry run: would write ${toRelativeRepoPath(tripDetailFilePath)}`)
    logStep(`Dry run: would update ${toRelativeRepoPath(tripsIndexPath)}`)
    return
  }

  logStep(`Ensuring local directory ${toRelativeRepoPath(tripDirectory)}`)
  await ensureDirectoryExists(tripDirectory)
  logStep(`Writing local trip file ${toRelativeRepoPath(tripDetailFilePath)}`)
  await fs.writeFile(tripDetailFilePath, tripDetailJson, 'utf8')
  logStep(`Updating local index file ${toRelativeRepoPath(tripsIndexPath)}`)
  await fs.writeFile(tripsIndexPath, tripsIndexJson, 'utf8')
}

async function uploadFile({ pathname, filePath, token, allowOverwrite = false }) {
  logStep(
    `Uploading to Vercel Blob: ${pathname} <- ${toRelativeRepoPath(filePath)}${allowOverwrite ? ' (overwrite enabled)' : ''}`,
  )
  const fileBuffer = await fs.readFile(filePath)
  const fileStats = await fs.stat(filePath)

  return put(pathname, fileBuffer, {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite,
    contentType: path.extname(filePath).toLowerCase() === '.json' ? 'application/json' : undefined,
    multipart: fileStats.size >= 5 * 1024 * 1024,
    token,
  })
}

async function uploadTripAssets({ sourceDir, tripSummary, tripDetailFilePath, token }) {
  logStep(`Preparing Vercel Blob uploads for ${tripSummary.year}/${tripSummary.slug}`)
  const { jpgFiles } = await resolvePhotoFiles(sourceDir)
  const uploadedPhotos = []

  for (const photoPath of jpgFiles) {
    const blobPath = `${tripSummary.photosPath}/${path.basename(photoPath)}`
    await uploadFile({
      pathname: blobPath,
      filePath: photoPath,
      token,
    })
    uploadedPhotos.push(blobPath)
  }

  await uploadFile({
    pathname: `trips/${tripSummary.year}/${tripSummary.slug}/trip.json`,
    filePath: tripDetailFilePath,
    token,
  })

  await uploadFile({
    pathname: 'trips/trips_index.json',
    filePath: tripsIndexPath,
    token,
    allowOverwrite: true,
  })

  return uploadedPhotos
}

function printSummary({
  tripSummary,
  tripDirectory,
  tripDetailFilePath,
  convertedFiles,
  coverResult,
  uploadedPhotos,
  dryRun,
}) {
  console.log('\nTrip onboarding summary')
  console.log(`- Trip: ${tripSummary.title} (${tripSummary.year}/${tripSummary.slug})`)
  console.log(`- Photos path: ${tripSummary.photosPath}`)

  if (convertedFiles.length > 0) {
    console.log(`- Converted HEIC files: ${convertedFiles.map((file) => path.basename(file)).join(', ')}`)
  } else {
    console.log('- Converted HEIC files: none')
  }

  if (coverResult.createdCover) {
    console.log(`- cover.jpg created from: ${path.basename(coverResult.selectedSource)}`)
  } else {
    console.log(`- cover.jpg reused: ${path.basename(coverResult.coverPath)}`)
  }

  console.log(`- Local trip file: ${toRelativeRepoPath(tripDetailFilePath)}`)
  console.log(`- Local trip directory: ${toRelativeRepoPath(tripDirectory)}`)
  console.log(`- Local index file: ${toRelativeRepoPath(tripsIndexPath)}`)

  if (dryRun) {
    console.log('- Blob uploads: dry run preview only')
  } else {
    console.log(`- Uploaded photo files: ${uploadedPhotos.length}`)
    console.log(`- Uploaded trip detail from: ${toRelativeRepoPath(tripDetailFilePath)}`)
    console.log(`- Uploaded trips index from: ${toRelativeRepoPath(tripsIndexPath)}`)
    console.log('- Next step: purge Vercel data cache or redeploy if the new trip does not appear immediately')
  }

  if (dryRun) {
    console.log('- Dry run: no files were written or uploaded')
  }
}

async function main() {
  const parsedArgs = parseArgs(process.argv.slice(2))

  await loadEnvFiles()

  const dryRun = parsedArgs.dryRun

  logStep('Collecting trip details')
  const tripInput = await resolveTripInput()
  const tripSummary = buildTripSummary(tripInput)
  const tripDetail = buildTripDetail(tripInput, tripSummary)
  const tripDirectory = path.join(tripMediaRoot, `${tripSummary.year}_${tripSummary.slug}`)
  const tripDetailFilePath = path.join(tripDirectory, 'trip.json')
  const token = process.env.ROBDLC_PERSONAL_WEBSITE_READ_WRITE_TOKEN

  if (!token) {
    throw new Error('Missing ROBDLC_PERSONAL_WEBSITE_READ_WRITE_TOKEN. Set it in your shell or .env.local.')
  }

  logStep(`Validating source photo directory ${tripInput.sourceDir}`)
  await fs.access(tripInput.sourceDir)
  const initialPhotoFiles = await resolvePhotoFiles(tripInput.sourceDir)

  const convertedFiles = await convertHeicFiles(initialPhotoFiles.heicFiles, dryRun)
  const photoFiles = await resolvePhotoFiles(tripInput.sourceDir)
  const coverResult = await ensureCoverPhoto({
    sourceDir: tripInput.sourceDir,
    jpgFiles: photoFiles.jpgFiles,
    dryRun,
  })

  const tripsIndex = await readJson(tripsIndexPath)
  await verifyTripIsNew({
    tripSummary,
    localTripsIndex: tripsIndex,
    tripDetailFilePath,
    token,
  })

  const nextTripsIndex = upsertTripsIndex(tripsIndex, tripSummary)
  const tripDetailJson = stringifyJson(tripDetail)
  const tripsIndexJson = stringifyJson(nextTripsIndex)

  await writeLocalFiles({
    tripDirectory,
    tripDetailFilePath,
    tripDetailJson,
    tripsIndexJson,
    dryRun,
  })

  let uploadedPhotos = []

  if (!dryRun) {
    uploadedPhotos = await uploadTripAssets({
      sourceDir: tripInput.sourceDir,
      tripSummary,
      tripDetailFilePath,
      token,
    })
  }

  printSummary({
    tripSummary,
    tripDirectory,
    tripDetailFilePath,
    convertedFiles,
    coverResult,
    uploadedPhotos,
    dryRun,
  })
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`Trip onboarding failed: ${message}`)
  process.exitCode = 1
})
