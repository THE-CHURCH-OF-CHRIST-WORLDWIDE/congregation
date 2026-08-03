#!/usr/bin/env node
/**
 * Copies the local env files into Netlify's per-context environment variables.
 *
 *   .env          → production context      (congregation-prod)
 *   .env.staging  → branch-deploy + deploy-preview contexts (congregation-staging)
 *
 * Netlify never reads these files itself — they are git-ignored and never uploaded — so this
 * script is just a typo-proof way of doing the 18 UI fields in one pass.
 *
 *   node scripts/netlify-env.mjs            # dry run: show what would be set
 *   node scripts/netlify-env.mjs --apply    # actually write to the linked Netlify site
 *
 * Requires `netlify login` and `netlify link` first. APP_ENV is deliberately not handled here:
 * netlify.toml owns it per context.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'

/** The variables the app reads. Keep in sync with runtimeConfig.public in nuxt.config.ts. */
const KEYS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_CLOUDINARY_CLOUD_NAME',
  'VITE_CLOUDINARY_UPLOAD_PRESET',
  'VITE_CLOUDINARY_FOLDER',
]

const SOURCES = [
  { file: '.env', label: 'production', contexts: ['production'] },
  { file: '.env.staging', label: 'staging', contexts: ['branch-deploy', 'deploy-preview'] },
]

const args = process.argv.slice(2)
const apply = args.includes('--apply')
const allowIdentical = args.includes('--allow-identical')

function die(message) {
  console.error(`\n✗ ${message}\n`)
  process.exit(1)
}

/** Minimal dotenv reader — enough for KEY=value files, quoted or not. */
function parseEnvFile(path) {
  if (!existsSync(path)) {
    die(`${path} not found. Create it from .env.example first.`)
  }
  const values = {}
  for (const raw of readFileSync(path, 'utf8').split('\n')) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq === -1) continue
    const key = line
      .slice(0, eq)
      .replace(/^export\s+/, '')
      .trim()
    let value = line.slice(eq + 1).trim()
    const quoted = value.length > 1 && (value.at(0) === '"' || value.at(0) === "'")
    if (quoted && value.at(-1) === value.at(0)) value = value.slice(1, -1)
    values[key] = value
  }
  return values
}

/** Never print credentials in full — this output ends up in terminals and CI logs. */
function mask(value) {
  if (value.length <= 8) return '*'.repeat(value.length)
  return `${value.slice(0, 4)}${'*'.repeat(Math.min(12, value.length - 8))}${value.slice(-4)}`
}

function resolveCli() {
  try {
    execFileSync('netlify', ['--version'], { stdio: 'ignore' })
    return { bin: 'netlify', lead: [] }
  } catch {
    return { bin: 'npx', lead: ['netlify-cli'] }
  }
}

// ── Read and validate ────────────────────────────────────────────────────────────────────────

const parsed = SOURCES.map((source) => ({ ...source, values: parseEnvFile(source.file) }))

const problems = []
for (const { file, values } of parsed) {
  for (const key of KEYS) {
    if (!values[key]) problems.push(`${file} is missing a value for ${key}`)
  }
}
if (problems.length) {
  die(`Cannot continue:\n  - ${problems.join('\n  - ')}`)
}

const [prod, staging] = parsed

// Identical project IDs mean both contexts would hit the same Firebase project, which defeats
// the entire point of the split — treat it as a mistake unless explicitly overridden.
const collisions = ['VITE_FIREBASE_PROJECT_ID', 'VITE_FIREBASE_API_KEY'].filter(
  (key) => prod.values[key] === staging.values[key]
)
if (collisions.length && !allowIdentical) {
  die(
    `${prod.file} and ${staging.file} share the same ${collisions.join(' and ')}.\n` +
      `  Both contexts would point at the same Firebase project.\n` +
      `  Fix the env files, or pass --allow-identical if this is genuinely intended.`
  )
}
if (prod.values.VITE_CLOUDINARY_FOLDER === staging.values.VITE_CLOUDINARY_FOLDER) {
  console.warn(
    `⚠ Both files use VITE_CLOUDINARY_FOLDER=${prod.values.VITE_CLOUDINARY_FOLDER} — ` +
      `staging uploads will land in the production media folder.`
  )
}

// ── Plan ─────────────────────────────────────────────────────────────────────────────────────

const plan = parsed.flatMap(({ file, values, contexts }) =>
  contexts.flatMap((context) => KEYS.map((key) => ({ file, key, value: values[key], context })))
)

console.log(`\n${apply ? 'Setting' : 'Would set'} ${plan.length} Netlify variables:\n`)
for (const { key, value, context, file } of plan) {
  console.log(`  ${context.padEnd(15)} ${key.padEnd(34)} ${mask(value)}   (from ${file})`)
}

if (!apply) {
  console.log(`\nDry run — nothing was changed. Re-run with --apply to write these.\n`)
  process.exit(0)
}

// ── Apply ────────────────────────────────────────────────────────────────────────────────────

const cli = resolveCli()

try {
  execFileSync(cli.bin, [...cli.lead, 'status'], { stdio: 'ignore' })
} catch {
  die(
    `This folder is not linked to a Netlify site.\n` +
      `  Run:  npx netlify-cli login  &&  npx netlify-cli link`
  )
}

let failed = 0
for (const { key, value, context } of plan) {
  const cliArgs = [...cli.lead, 'env:set', key, value, '--context', context]
  try {
    execFileSync(cli.bin, cliArgs, { stdio: ['ignore', 'ignore', 'pipe'] })
    console.log(`  ✓ ${context.padEnd(15)} ${key}`)
  } catch (error) {
    failed++
    console.error(`  ✗ ${context.padEnd(15)} ${key} — ${String(error.stderr ?? error).trim()}`)
  }
}

console.log(
  failed
    ? `\n${plan.length - failed} set, ${failed} failed.\n`
    : `\nAll ${plan.length} variables set. Trigger a redeploy for them to take effect —\n` +
        `existing deploys keep the values they were built with.\n`
)
process.exit(failed ? 1 : 0)
