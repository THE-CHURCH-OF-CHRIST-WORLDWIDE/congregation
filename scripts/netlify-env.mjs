#!/usr/bin/env node
/**
 * Copies one local env file into the environment variables of its Netlify site.
 *
 *   production  ← .env.production  → coc-abadina-prod     (main branch, project coc-abadina)
 *   staging     ← .env.staging     → coc-abadina-staging  (dev branch, project coc-abadina-staging)
 *
 * The site is passed explicitly with `--site`, so the currently linked project is irrelevant and
 * there is no need to re-link between runs. `.env` is never uploaded — it is only the default for
 * local `npm run dev`.
 *
 *   npm run netlify:env -- staging              # dry run: show what would change
 *   npm run netlify:env -- staging --apply      # write, then read back to confirm
 *
 * Needs `netlify login` once. Override the target with `--site=<name-or-id>` if a site is renamed.
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
  production: { file: '.env.production', appEnv: 'production', site: 'coc-abadina-prod' },
  staging: { file: '.env.staging', appEnv: 'staging', site: 'coc-abadina-staging' },
}

const args = process.argv.slice(2)
const target = args.find((arg) => !arg.startsWith('--'))
const apply = args.includes('--apply')
const allowIdentical = args.includes('--allow-identical')
const siteOverride = args.find((arg) => arg.startsWith('--site='))?.slice('--site='.length)

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
  if (!value) return '(unset)'
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

// ── Read and validate both files ─────────────────────────────────────────────────────────────

const chosen = ENVIRONMENTS[target]
const site = siteOverride ?? chosen.site
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

// ── Read what the site currently holds ───────────────────────────────────────────────────────

const cli = resolveCli()

/** The CLI has shipped both {KEY: "value"} and {KEY: {value}} shapes; accept either. */
function normalise(parsed) {
  return Object.fromEntries(
    Object.entries(parsed).map(([key, value]) => [
      key,
      typeof value === 'string' ? value : (value?.value ?? null),
    ])
  )
}

function currentEnv() {
  try {
    // `--context` matters: env:list defaults to `dev`, which is NOT what a deploy builds with,
    // and reports variables as unset when they are merely set for other contexts. Each of these
    // sites deploys its own branch, so `production` is the context both actually build in.
    const raw = execFileSync(
      cli.bin,
      [...cli.lead, 'env:list', '--site', site, '--context', 'production', '--json'],
      {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      }
    )
    return normalise(JSON.parse(raw))
  } catch (error) {
    die(
      `Could not read environment variables for Netlify site "${site}".\n` +
        `  ${
          String(error.stderr ?? error.message ?? error)
            .trim()
            .split('\n')[0]
        }\n` +
        `  Check the site name (npx netlify-cli sites:list) or pass --site=<name-or-id>.`
    )
  }
}

const before = currentEnv()

// ── Plan ─────────────────────────────────────────────────────────────────────────────────────

const plan = [
  { key: 'APP_ENV', value: chosen.appEnv },
  ...KEYS.map((key) => ({ key, value: files[target][key] })),
].map((entry) => ({ ...entry, changes: before[entry.key] !== entry.value }))

const changing = plan.filter((entry) => entry.changes)

console.log(
  `\n${apply ? 'Writing to' : 'Would write to'} Netlify site "${site}" from ${chosen.file}:\n`
)
for (const { key, value, changes } of plan) {
  const shown = key === 'APP_ENV' ? value : mask(value)
  const note = changes
    ? `  ← was ${key === 'APP_ENV' ? (before[key] ?? '(unset)') : mask(before[key])}`
    : '  (unchanged)'
  console.log(`  ${key.padEnd(34)} ${shown}${note}`)
}
console.log(`\n  ${changing.length} of ${plan.length} would change.`)

if (!apply) {
  console.log(`\nDry run — nothing was changed. Re-run with --apply to write these.\n`)
  process.exit(0)
}

// ── Apply ────────────────────────────────────────────────────────────────────────────────────

console.log()
let failed = 0
for (const { key, value } of plan) {
  try {
    execFileSync(cli.bin, [...cli.lead, 'env:set', key, value, '--site', site], {
      stdio: ['ignore', 'ignore', 'pipe'],
    })
    console.log(`  ✓ ${key}`)
  } catch (error) {
    failed++
    console.error(`  ✗ ${key} — ${String(error.stderr ?? error).trim()}`)
  }
}

if (failed) {
  console.error(`\n${plan.length - failed} set, ${failed} failed.\n`)
  process.exit(1)
}

// ── Read back ────────────────────────────────────────────────────────────────────────────────
//
// Setting a variable and the site actually holding it are different claims. Read the values back
// so the run either proves itself or admits it could not.

const after = currentEnv()
const absent = plan.filter(({ key }) => after[key] === undefined)
const wrong = plan.filter(({ key, value }) => after[key] !== undefined && after[key] !== value)

if (absent.length || wrong.length) {
  for (const { key } of absent) console.error(`  ✗ ${key} is not set on the site`)
  for (const { key } of wrong) console.error(`  ✗ ${key} does not match ${chosen.file}`)
  console.error(
    `\nThe site does not hold what this run intended. Inspect with:\n` +
      `  npx netlify-cli env:list --site ${site}\n`
  )
  process.exit(1)
}

console.log(
  `\n  verified: "${site}" reports all ${plan.length} values as set\n\n` +
    `Done — ${site} is configured for ${target} (APP_ENV=${chosen.appEnv}, ` +
    `Firebase project ${files[target].VITE_FIREBASE_PROJECT_ID}).\n` +
    `Now trigger a redeploy: existing deploys keep the values they were built with.\n`
)
