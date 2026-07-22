#!/usr/bin/env node

/**
 * One-off HEIC → JPEG converter using the same `sips` approach as
 * scripts/onboard-trip.mjs (trip photo onboarding).
 *
 * Usage:
 *   pnpm heic:convert path/to/photo.HEIC
 *   pnpm heic:convert path/to/photo.HEIC --out path/to/photo.jpg
 *   pnpm heic:convert path/to/folder
 *   pnpm heic:convert path/to/folder --out path/to/output-folder
 *   pnpm heic:convert path/to/photo.HEIC --dry-run
 */

import { execFile } from 'node:child_process'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

function printUsage() {
  console.log(`Usage:
  pnpm heic:convert <input.heic|input-dir> [--out <file-or-dir>] [--dry-run]

Examples:
  pnpm heic:convert ~/Downloads/IMG_1234.HEIC
  pnpm heic:convert ~/Downloads/IMG_1234.HEIC --out media/about-me/about-me-picture.jpeg
  pnpm heic:convert ~/Downloads/heic-batch --out ~/Downloads/jpg-batch
`)
}

function parseArgs(argv) {
  const args = {
    dryRun: false,
    out: null,
    input: null,
  }

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]

    if (arg === '--dry-run') {
      args.dryRun = true
      continue
    }

    if (arg === '--out') {
      const value = argv[i + 1]
      if (!value || value.startsWith('-')) {
        throw new Error('--out requires a file or directory path')
      }
      args.out = path.resolve(value)
      i += 1
      continue
    }

    if (arg === '--help' || arg === '-h') {
      args.help = true
      continue
    }

    if (arg.startsWith('-')) {
      throw new Error(`Unknown flag: ${arg}`)
    }

    if (args.input) {
      throw new Error('Only one input path is supported')
    }

    args.input = path.resolve(arg)
  }

  return args
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath)
    return true
  } catch {
    return false
  }
}

async function collectHeicFiles(inputPath) {
  const stats = await fs.stat(inputPath)

  if (stats.isFile()) {
    if (!/\.heic$/i.test(inputPath)) {
      throw new Error(`Input file must be .heic/.HEIC: ${inputPath}`)
    }
    return [inputPath]
  }

  if (!stats.isDirectory()) {
    throw new Error(`Input must be a HEIC file or directory: ${inputPath}`)
  }

  const entries = await fs.readdir(inputPath, { withFileTypes: true })
  const heicFiles = entries
    .filter((entry) => entry.isFile() && /\.heic$/i.test(entry.name))
    .map((entry) => path.join(inputPath, entry.name))
    .sort((left, right) => left.localeCompare(right, undefined, { sensitivity: 'base' }))

  if (heicFiles.length === 0) {
    throw new Error(`No HEIC files found in ${inputPath}`)
  }

  return heicFiles
}

function resolveDestination(heicFile, { inputPath, outPath, inputIsDirectory }) {
  const jpgName = `${path.basename(heicFile, path.extname(heicFile))}.jpg`

  if (!outPath) {
    return path.join(path.dirname(heicFile), jpgName)
  }

  if (!inputIsDirectory) {
    // Single-file conversion: --out can be a full file path or a directory.
    if (/\.(jpe?g)$/i.test(outPath)) {
      return outPath
    }
    return path.join(outPath, jpgName)
  }

  // Directory conversion: --out is treated as an output directory.
  return path.join(outPath, jpgName)
}

async function convertHeicFile(heicFile, destinationFile, dryRun) {
  if (dryRun) {
    console.log(`Dry run: would convert ${heicFile} -> ${destinationFile}`)
    return
  }

  await fs.mkdir(path.dirname(destinationFile), { recursive: true })
  console.log(`Converting ${path.basename(heicFile)} -> ${destinationFile}`)
  await execFileAsync('sips', ['-s', 'format', 'jpeg', heicFile, '--out', destinationFile])
}

async function main() {
  let args

  try {
    args = parseArgs(process.argv.slice(2))
  } catch (error) {
    console.error(error.message)
    printUsage()
    process.exitCode = 1
    return
  }

  if (args.help || !args.input) {
    printUsage()
    process.exitCode = args.help ? 0 : 1
    return
  }

  if (!(await pathExists(args.input))) {
    console.error(`Input path does not exist: ${args.input}`)
    process.exitCode = 1
    return
  }

  const inputStats = await fs.stat(args.input)
  const inputIsDirectory = inputStats.isDirectory()
  const heicFiles = await collectHeicFiles(args.input)

  for (const heicFile of heicFiles) {
    const destinationFile = resolveDestination(heicFile, {
      inputPath: args.input,
      outPath: args.out,
      inputIsDirectory,
    })
    await convertHeicFile(heicFile, destinationFile, args.dryRun)
  }

  console.log(
    args.dryRun
      ? `Dry run complete (${heicFiles.length} file${heicFiles.length === 1 ? '' : 's'}).`
      : `Converted ${heicFiles.length} file${heicFiles.length === 1 ? '' : 's'}.`
  )
}

main().catch((error) => {
  console.error(error.message || error)
  process.exitCode = 1
})
