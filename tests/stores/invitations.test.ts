import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { useInvitationsStore } from '~/stores/invitations'
import type { Invitation } from '~/types'

/**
 * Inviting has two halves that must not drift: a Firestore document a Super Admin writes, and
 * the emailed link the invitee follows. The document is what Firestore rules check when the
 * invitee claims a role, and rules match its id against the token email — so the id has to be
 * the lower-cased address, and the claim must refuse anything an invitation does not cover.
 */
let stored: Invitation[] = []
let failNextWrite = false
let failSend = false

const createInvitation = vi.fn(async (email: string, roleId: string, invitedBy?: string) => {
  if (failNextWrite) throw new Error('Missing or insufficient permissions.')
  const invitation = {
    email: email.trim().toLowerCase(),
    roleId,
    invitedAt: '2026-08-04T00:00:00.000Z',
    ...(invitedBy ? { invitedBy } : {}),
  } as Invitation
  stored.push(invitation)
  return invitation
})

const deleteInvitation = vi.fn(async (email: string) => {
  stored = stored.filter((i) => i.email !== email.trim().toLowerCase())
})

const fetchInvitation = vi.fn(
  async (email: string) => stored.find((i) => i.email === email.trim().toLowerCase()) ?? null
)

vi.mock('~/repositories/invitationsRepository', () => ({
  invitationId: (email: string) => email.trim().toLowerCase(),
  useInvitationsRepository: () => ({
    fetchInvitations: async () => stored,
    fetchInvitation,
    createInvitation,
    deleteInvitation,
  }),
}))

const setUserRole = vi.fn(async () => {})

vi.mock('~/repositories/usersRepository', () => ({
  useUsersRepository: () => ({ setUserRole, fetchUserRecord: vi.fn() }),
}))

let sendErrorCode: string | null = null
const sendSignInLinkToEmail = vi.fn(async () => {
  if (sendErrorCode) {
    const err = new Error(`Firebase: Error (${sendErrorCode}).`) as Error & { code: string }
    err.code = sendErrorCode
    throw err
  }
  if (failSend) throw new Error('auth/invalid-continue-uri')
})
const signInWithEmailLink = vi.fn(async (_auth: unknown, email: string) => ({
  user: { uid: 'new-uid', email: email.trim().toLowerCase() },
}))

vi.mock('firebase/auth', () => ({
  sendSignInLinkToEmail: (...args: unknown[]) => sendSignInLinkToEmail(...(args as [])),
  signInWithEmailLink: (auth: unknown, email: string) => signInWithEmailLink(auth, email),
  isSignInWithEmailLink: (_auth: unknown, href: string) => href.includes('apiKey='),
}))

mockNuxtImport('useNuxtApp', () => () => ({ $auth: {}, $firestore: {} }))

describe('useInvitationsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    stored = []
    failNextWrite = false
    failSend = false
    sendErrorCode = null
    createInvitation.mockClear()
    deleteInvitation.mockClear()
    fetchInvitation.mockClear()
    setUserRole.mockClear()
    sendSignInLinkToEmail.mockClear()
    signInWithEmailLink.mockClear()
  })

  it('records the invitation before sending the link', async () => {
    const store = useInvitationsStore()
    await store.invite('Deacon@Example.COM', 'deacon', 'admin@example.com')

    expect(createInvitation.mock.invocationCallOrder[0]).toBeLessThan(
      sendSignInLinkToEmail.mock.invocationCallOrder[0]!
    )
    // Lower-cased, because rules match the id against the token email.
    expect(store.invitations[0]!.email).toBe('deacon@example.com')
  })

  it('keeps the invitation listed when the email fails to send', async () => {
    const store = useInvitationsStore()
    failSend = true

    await expect(store.invite('deacon@example.com', 'deacon')).rejects.toThrow()

    // The document exists, so the invitation can be re-sent rather than being lost.
    expect(stored).toHaveLength(1)
  })

  it('does not send a link when the invitation could not be written', async () => {
    const store = useInvitationsStore()
    failNextWrite = true

    await expect(store.invite('deacon@example.com', 'deacon')).rejects.toThrow()

    // A link with no invitation behind it would sign someone in with no role at all.
    expect(sendSignInLinkToEmail).not.toHaveBeenCalled()
  })

  it('ignores a blank email', async () => {
    const store = useInvitationsStore()
    await store.invite('   ', 'deacon')

    expect(createInvitation).not.toHaveBeenCalled()
  })

  it('drops a revoked invitation', async () => {
    const store = useInvitationsStore()
    await store.invite('deacon@example.com', 'deacon')
    await store.revoke('deacon@example.com')

    expect(store.invitations).toHaveLength(0)
  })

  it('recognises only a real sign-in link', () => {
    const store = useInvitationsStore()

    expect(store.isInviteLink('https://site/invite?apiKey=abc&oobCode=xyz')).toBe(true)
    expect(store.isInviteLink('https://site/invite')).toBe(false)
  })

  it('names the setting to change when email link sign-in is disabled', async () => {
    const store = useInvitationsStore()
    sendErrorCode = 'auth/operation-not-allowed'

    await expect(store.invite('deacon@example.com', 'deacon')).rejects.toThrow()

    // The raw code tells the admin nothing; the message must point at the console setting.
    expect(store.error).toMatch(/Email link sign-in is not enabled/i)
    expect(store.error).toMatch(/Sign-in method/i)
    // The invitation still exists, so it can simply be re-sent once the setting is on.
    expect(stored).toHaveLength(1)
  })

  it('names the authorized-domains setting when the continue URL is rejected', async () => {
    const store = useInvitationsStore()
    sendErrorCode = 'auth/unauthorized-continue-uri'

    await expect(store.invite('deacon@example.com', 'deacon')).rejects.toThrow()

    expect(store.error).toMatch(/Authorized domains/i)
  })

  it('claims the invitation, granting exactly the invited role', async () => {
    const store = useInvitationsStore()
    stored = [{ email: 'deacon@example.com', roleId: 'deacon', invitedAt: '2026-08-04' }]

    const role = await store.claim('Deacon@Example.com', 'https://site/invite?apiKey=abc')

    expect(role).toBe('deacon')
    expect(setUserRole).toHaveBeenCalledWith('new-uid', 'deacon', 'deacon@example.com')
    // Claimed invitations are cleared so they cannot be reused.
    expect(deleteInvitation).toHaveBeenCalledWith('deacon@example.com')
  })

  it('refuses to grant anything when no invitation exists', async () => {
    const store = useInvitationsStore()
    stored = []

    await expect(
      store.claim('stranger@example.com', 'https://site/invite?apiKey=abc')
    ).rejects.toThrow(/No invitation found/)

    expect(setUserRole).not.toHaveBeenCalled()
  })
})
