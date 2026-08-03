#!/usr/bin/env node
/**
 * Preflight for the `--dotenv` build scripts.
 *
 * Nuxt silently ignores a `--dotenv` path that does not exist, so a typo or a missing
 * `.env.production` yields a build whose runtimeConfig is empty. That failure only surfaces
 * later in the browser as Firebase's `auth/invalid-api-key`, far from its cause — fail here
 * instead.
 */
import { existsSync } from 'node:fs'

const file = process.argv[2]

if (!file) {
  console.error('usage: node scripts/require-dotenv.mjs <env-file>')
  process.exit(1)
}

if (!existsSync(file)) {
  console.error(
    `\n✗ ${file} not found — this build would ship an empty Firebase config.\n` +
      `  Create it from .env.example:  cp .env.example ${file}\n`
  )
  process.exit(1)
}
