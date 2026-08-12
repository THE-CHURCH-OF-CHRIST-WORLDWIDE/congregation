import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { STAFF_ROLES } from '~/stores/auth'

/**
 * The app and `firestore.rules` each keep their own list of roles, and neither can see the other.
 * A role added to one and forgotten in the other is a specific, quiet failure: the account signs
 * in, reaches the dashboard, and then every read is refused — which reads as a broken app rather
 * than as a missing entry in a list.
 *
 * The rules file carries a comment asking that the two be kept in step. This is what enforces it.
 */
// Resolved from the project root: Vitest runs there, and `import.meta.url` is not a file URL
// under this environment.
const rules = readFileSync(resolve(process.cwd(), 'firestore.rules'), 'utf8')

/** Pull the role ids out of a `roleId() in [...]` list inside a named rules function. */
function roleIdsIn(functionName: string): string[] {
  const body = new RegExp(`function ${functionName}\\(\\)\\s*\\{([\\s\\S]*?)\\}`).exec(rules)?.[1]
  expect(body, `${functionName}() not found in firestore.rules`).toBeTruthy()
  const list = /roleId\(\)\s*(?:==|in)\s*(\[[\s\S]*?\]|'[a-z-]+')/.exec(body!)?.[1]
  expect(list, `no role list found in ${functionName}()`).toBeTruthy()
  return [...list!.matchAll(/'([a-z-]+)'/g)].map((m) => m[1]!)
}

describe('firestore.rules and the app agree about roles', () => {
  it('isStaff() lists exactly the same roles as STAFF_ROLES', () => {
    expect(roleIdsIn('isStaff').sort()).toEqual([...STAFF_ROLES].sort())
  })

  it('every write gate names only roles the app knows about', () => {
    const known = new Set<string>(STAFF_ROLES)
    for (const gate of [
      'canEditSettings',
      'canEditFinance',
      'canEditRecords',
      'canEditPublishedContent',
    ]) {
      for (const roleId of roleIdsIn(gate)) {
        expect(known, `${gate}() names unknown role "${roleId}"`).toContain(roleId)
      }
    }
  })

  /**
   * The Content Editor's boundary, enforced where it actually counts. `canEditRecords()` gates
   * attendance registers, visitors and children's figures — personal data about named members.
   */
  it('keeps the Content Editor out of the registers', () => {
    expect(roleIdsIn('canEditRecords')).not.toContain('content-editor')
  })

  it('lets the Content Editor write the public site content', () => {
    expect(roleIdsIn('canEditPublishedContent')).toContain('content-editor')
    expect(roleIdsIn('canEditSettings')).toContain('content-editor')
  })

  it('keeps the Content Editor out of the books', () => {
    expect(roleIdsIn('canEditFinance')).not.toContain('content-editor')
  })

  /** Access control is a tier above content, and stays that way. */
  it('grants nobody but the Super Admin access to roles and accounts', () => {
    expect(roleIdsIn('isSuperAdmin')).toEqual(['super-admin'])
  })
})
