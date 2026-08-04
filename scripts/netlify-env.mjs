#!/usr/bin/env node
/**
 * Copies one local env file into the environment variables of the linked Netlify site.
 *
 *   production  ← .env.production  → coc-abadina-prod     (main branch, project coc-abadina)
 *   staging     ← .env.staging     → coc-abadina-staging  (dev branch, project coc-abadina-staging)
 *
 * `.env` is not used here at all — it is only the default for local `npm run dev`.
 *
 * Staging and production are two separate Netlify sites, so each one carries its own copy of
 * the variables — including APP_ENV. It cannot live in netlify.toml: that file is committed and
 * shared, and each site is the production context for its own branch, so a
 * `[context.production]` block would label the staging site as production too.
 *
 *   npm run netlify:env -- staging              # dry run: show what would be set
 *   npm run netlify:env -- staging --apply      # write to the linked site
 *
 * Run `netlify link` first, and re-link when switching sites — the script refuses to write
 * staging values to a site whose name looks like production, and vice versa.
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

const ENVIRONMENTS = {
  production: { file: '.env.production', appEnv: 'production', siteMatches: /prod/i },
  staging: { file: '.env.staging', appEnv: 'staging', siteMatches: /staging|stage/i },
}

const args = process.argv.slice(2)
const target = args.find((arg) => !arg.startsWith('--'))
const apply = args.includes('--apply')
const force = args.includes('--force')
const allowIdentical = args.includes('--allow-identical')

function die(message) {
  console.error(`\n✗ ${message}\n`)
  process.exit(1)
}

if (!target || !(target in ENVIRONMENTS)) {
  die(
    `Specify which environment to write: ${Object.keys(ENVIRONMENTS).join(' | ')}\n` +
      `  e.g.  npm run netlify:env -- staging`
  )
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

/** The linked site, from the local link state written by `netlify link`. */
function linkedSiteId() {
  const statePath = '.netlify/state.json'
  if (!existsSync(statePath)) {
    die(`This folder is not linked to a Netlify site.\n  Run:  npx netlify-cli link`)
  }
  const { siteId } = JSON.parse(readFileSync(statePath, 'utf8'))
  if (!siteId) die(`${statePath} has no siteId. Re-run:  npx netlify-cli link`)
  return siteId
}

function siteNameFor(cli, siteId) {
  try {
    const raw = execFileSync(
      cli.bin,
      [...cli.lead, 'api', 'getSite', '--data', JSON.stringify({ site_id: siteId })],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
    )
    return JSON.parse(raw).name ?? null
  } catch {
    return null
  }
}

// ── Read and validate both files ─────────────────────────────────────────────────────────────

const chosen = ENVIRONMENTS[target]
const files = Object.fromEntries(
  Object.entries(ENVIRONMENTS).map(([name, env]) => [name, parseEnvFile(env.file)])
)

const problems = []
for (const [name, values] of Object.entries(files)) {
  for (const key of KEYS) {
    if (!values[key]) problems.push(`${ENVIRONMENTS[name].file} is missing a value for ${key}`)
  }
}
if (problems.length) {
  die(`Cannot continue:\n  - ${problems.join('\n  - ')}`)
}

// Identical project IDs mean both sites would hit the same Firebase project, which defeats the
// entire point of the split — treat it as a mistake unless explicitly overridden.
const collisions = ['VITE_FIREBASE_PROJECT_ID', 'VITE_FIREBASE_API_KEY'].filter(
  (key) => files.production[key] === files.staging[key]
)
if (collisions.length && !allowIdentical) {
  die(
    `${ENVIRONMENTS.production.file} and ${ENVIRONMENTS.staging.file} share the same ` +
      `${collisions.join(' and ')}.\n` +
      `  Both sites would point at the same Firebase project.\n` +
      `  Fix the env files, or pass --allow-identical if this is genuinely intended.`
  )
}
if (files.production.VITE_CLOUDINARY_FOLDER === files.staging.VITE_CLOUDINARY_FOLDER) {
  console.warn(
    `⚠ Both files use VITE_CLOUDINARY_FOLDER=${files.production.VITE_CLOUDINARY_FOLDER} — ` +
      `staging uploads will land in the production media folder.`
  )
}

// ── Confirm we are pointed at the right site ─────────────────────────────────────────────────

const cli = resolveCli()
const siteId = linkedSiteId()
const siteName = siteNameFor(cli, siteId)

if (siteName === null) {
  console.warn(
    `⚠ Could not read the linked site's name (not logged in?). Site id: ${siteId}\n` +
      `  The name check below is skipped — make sure this is the ${target} site.`
  )
} else if (!chosen.siteMatches.test(siteName) && !force) {
  die(
    `Refusing to write ${target} values to Netlify site "${siteName}".\n` +
      `  Its name does not look like a ${target} site, which is exactly how staging ends up\n` +
      `  serving production data. Re-link with \`npx netlify-cli link\`, or pass --force.`
  )
}

// ── Plan ─────────────────────────────────────────────────────────────────────────────────────

const plan = [
  { key: 'APP_ENV', value: chosen.appEnv },
  ...KEYS.map((key) => ({ key, value: files[target][key] })),
]

console.log(
  `\n${apply ? 'Setting' : 'Would set'} ${plan.length} variables on ` +
    `${siteName ? `"${siteName}"` : `site ${siteId}`} from ${chosen.file}:\n`
)
for (const { key, value } of plan) {
  console.log(`  ${key.padEnd(34)} ${key === 'APP_ENV' ? value : mask(value)}`)
}

if (!apply) {
  console.log(`\nDry run — nothing was changed. Re-run with --apply to write these.\n`)
  process.exit(0)
}

// ── Apply ────────────────────────────────────────────────────────────────────────────────────

let failed = 0
for (const { key, value } of plan) {
  try {
    execFileSync(cli.bin, [...cli.lead, 'env:set', key, value], {
      stdio: ['ignore', 'ignore', 'pipe'],
    })
    console.log(`  ✓ ${key}`)
  } catch (error) {
    failed++
    console.error(`  ✗ ${key} — ${String(error.stderr ?? error).trim()}`)
  }
}

console.log(
  failed
    ? `\n${plan.length - failed} set, ${failed} failed.\n`
    : `\nAll ${plan.length} variables set on ${siteName ?? siteId}. Trigger a redeploy —\n` +
        `existing deploys keep the values they were built with.\n`
)
process.exit(failed ? 1 : 0)
