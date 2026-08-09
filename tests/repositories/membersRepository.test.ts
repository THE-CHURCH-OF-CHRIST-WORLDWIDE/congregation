import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { ChurchNumberTakenError, useMembersRepository } from '~/repositories/membersRepository'

/**
 * Church numbers have to be unique, and Firestore has no unique constraint. The repository
 * enforces it with a reservation document at `memberNumbers/{key}` claimed inside a
 * transaction, so these tests are about the reservation moving in step with the member:
 * claimed on assignment, released on change, on clearing, and on delete — and never two
 * members holding one number.
 *
 * The fake below applies a transaction's writes only after its callback resolves, mirroring
 * Firestore's all-or-nothing commit. That is what lets a test assert that a rejected claim
 * leaves the member record untouched too.
 */
let db: Map<string, Record<string, unknown>>
let autoId = 0

type Ref = { path: string; id: string }

function makeRef(path: string): Ref {
  return { path, id: path.split('/')[1]! }
}

vi.mock('firebase/firestore', () => ({
  collection: (_db: unknown, name: string) => ({ __collection: name }),
  doc: (a: unknown, b?: string, c?: string) => {
    // doc(db, 'members', id) vs doc(collectionRef) — the latter generates an id.
    if (typeof b === 'string' && typeof c === 'string') return makeRef(`${b}/${c}`)
    return makeRef(`${(a as { __collection: string }).__collection}/auto-${++autoId}`)
  },
  serverTimestamp: () => '<server-timestamp>',
  query: (c: unknown) => c,
  orderBy: () => undefined,
  getDocs: async (c: { __collection: string }) =>
    ({
      docs: [...db.entries()]
        .filter(([path]) => path.startsWith(`${c.__collection}/`))
        .map(([path, data]) => ({ id: path.split('/')[1]!, data: () => data })),
    }) as never,
  setDoc: async (ref: Ref, data: Record<string, unknown>, opts?: { merge?: boolean }) => {
    db.set(ref.path, opts?.merge ? { ...db.get(ref.path), ...data } : data)
  },
  runTransaction: async (_db: unknown, fn: (tx: unknown) => Promise<void>) => {
    const writes: Array<() => void> = []
    const tx = {
      get: async (ref: Ref) => ({
        exists: () => db.has(ref.path),
        data: () => db.get(ref.path),
      }),
      set: (ref: Ref, data: Record<string, unknown>, opts?: { merge?: boolean }) => {
        writes.push(() => db.set(ref.path, opts?.merge ? { ...db.get(ref.path), ...data } : data))
      },
      delete: (ref: Ref) => writes.push(() => db.delete(ref.path)),
    }
    // A throw skips the commit entirely, exactly as a real aborted transaction would.
    await fn(tx)
    writes.forEach((w) => w())
  },
}))

mockNuxtImport('useNuxtApp', () => () => ({ $firestore: {} }))

const BASE = {
  gender: 'Male',
  phone: '0800',
  email: '',
  status: 'Active',
  absenceCount: 0,
} as const

beforeEach(() => {
  db = new Map()
  autoId = 0
})

describe('claiming a church number', () => {
  it('reserves the number against the member', async () => {
    const repo = useMembersRepository()
    const created = await repo.createMember({ ...BASE, name: 'Ekaette', churchNumber: 'COC/001' })

    expect(db.get('memberNumbers/coc-001')).toMatchObject({
      memberId: created.id,
      churchNumber: 'COC/001',
    })
  })

  it('refuses a number another member already holds', async () => {
    const repo = useMembersRepository()
    await repo.createMember({ ...BASE, name: 'Ekaette', churchNumber: 'COC/001' })
    const second = await repo.createMember({ ...BASE, name: 'Ubong' })

    await expect(repo.updateMember(second.id, { churchNumber: 'COC/001' })).rejects.toThrow(
      ChurchNumberTakenError
    )
  })

  it('names who holds it, so the form can say more than "taken"', async () => {
    const repo = useMembersRepository()
    await repo.createMember({ ...BASE, name: 'Ekaette', churchNumber: 'COC/001' })
    const second = await repo.createMember({ ...BASE, name: 'Ubong' })

    await expect(repo.updateMember(second.id, { churchNumber: 'COC/001' })).rejects.toThrow(
      /already assigned to Ekaette/i
    )
  })

  it('rejects a clash however it was typed', async () => {
    const repo = useMembersRepository()
    await repo.createMember({ ...BASE, name: 'Ekaette', churchNumber: 'COC/001' })
    const second = await repo.createMember({ ...BASE, name: 'Ubong' })

    // Same number, different punctuation and case.
    await expect(repo.updateMember(second.id, { churchNumber: 'coc-001' })).rejects.toThrow(
      ChurchNumberTakenError
    )
  })

  it('leaves the member record untouched when the claim is refused', async () => {
    const repo = useMembersRepository()
    await repo.createMember({ ...BASE, name: 'Ekaette', churchNumber: 'COC/001' })
    const second = await repo.createMember({ ...BASE, name: 'Ubong' })

    await repo
      .updateMember(second.id, { name: 'Ubong Edet', churchNumber: 'COC/001' })
      .catch(() => {})

    // The rename rode along with the number; neither may land on its own.
    expect(db.get(`members/${second.id}`)).toMatchObject({ name: 'Ubong' })
  })

  it('lets a member keep their own number across an unrelated edit', async () => {
    const repo = useMembersRepository()
    const m = await repo.createMember({ ...BASE, name: 'Ekaette', churchNumber: 'COC/001' })

    await repo.updateMember(m.id, { churchNumber: 'COC/001', name: 'Ekaette Udo' })

    expect(db.get(`members/${m.id}`)).toMatchObject({ name: 'Ekaette Udo' })
    expect(db.get('memberNumbers/coc-001')).toMatchObject({ memberId: m.id })
  })

  it('reserves nothing when no number is assigned', async () => {
    const repo = useMembersRepository()
    await repo.createMember({ ...BASE, name: 'Ubong' })

    expect([...db.keys()].some((k) => k.startsWith('memberNumbers/'))).toBe(false)
  })
})

describe('releasing a church number', () => {
  it('frees the old number when it changes, so it can be reused', async () => {
    const repo = useMembersRepository()
    const m = await repo.createMember({ ...BASE, name: 'Ekaette', churchNumber: 'COC/001' })

    await repo.updateMember(m.id, { churchNumber: 'COC/002' })

    expect(db.has('memberNumbers/coc-001')).toBe(false)
    expect(db.get('memberNumbers/coc-002')).toMatchObject({ memberId: m.id })

    // And the freed number is genuinely available to somebody else.
    const other = await repo.createMember({ ...BASE, name: 'Ubong' })
    await repo.updateMember(other.id, { churchNumber: 'COC/001' })
    expect(db.get('memberNumbers/coc-001')).toMatchObject({ memberId: other.id })
  })

  it('frees the number when it is cleared', async () => {
    const repo = useMembersRepository()
    const m = await repo.createMember({ ...BASE, name: 'Ekaette', churchNumber: 'COC/001' })

    await repo.updateMember(m.id, { churchNumber: '' })

    expect(db.has('memberNumbers/coc-001')).toBe(false)
  })

  it('frees the number when the member is deleted', async () => {
    const repo = useMembersRepository()
    const m = await repo.createMember({ ...BASE, name: 'Ekaette', churchNumber: 'COC/001' })

    await repo.deleteMember(m.id)

    expect(db.has(`members/${m.id}`)).toBe(false)
    // A deleted member holding a number hostage would be invisible and unfixable from the UI.
    expect(db.has('memberNumbers/coc-001')).toBe(false)
  })

  it('leaves the reservation alone on an edit that does not mention the number', async () => {
    const repo = useMembersRepository()
    const m = await repo.createMember({ ...BASE, name: 'Ekaette', churchNumber: 'COC/001' })

    await repo.updateMember(m.id, { phone: '0900' })

    expect(db.get('memberNumbers/coc-001')).toMatchObject({ memberId: m.id })
    expect(db.get(`members/${m.id}`)).toMatchObject({ churchNumber: 'COC/001', phone: '0900' })
  })
})
