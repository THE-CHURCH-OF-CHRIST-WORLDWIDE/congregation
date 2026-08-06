import { defineStore } from 'pinia'
import { recordAudit } from '~/utils/audit'
import { isSignInWithEmailLink, sendSignInLinkToEmail, signInWithEmailLink } from 'firebase/auth'
import { useInvitationsRepository } from '~/repositories/invitationsRepository'
import { useUsersRepository } from '~/repositories/usersRepository'
import type { ChurchRoleId, Invitation } from '~/types'

/**
 * Inviting someone to the dashboard, without a backend.
 *
 * Creating a Firebase Auth account needs the Admin SDK, which needs Cloud Functions and the
 * Blaze plan. Email-link sign-in avoids both: Firebase emails the invitee a link, clicking it
 * creates their account with an already-verified email, and the app then claims the invitation
 * to write `users/{uid}`.
 *
 * Requires **Email link (passwordless sign-in)** to be enabled under Authentication → Sign-in
 * method, and the site's domain listed under Authorized domains.
 */
/**
 * Sending an invitation fails for configuration reasons far more often than user ones, and
 * Firebase reports those as bare codes. Name the setting that needs changing instead.
 */
function inviteErrorMessage(e: unknown): string {
  const code = (e as { code?: string })?.code ?? ''
  switch (code) {
    case 'auth/operation-not-allowed':
      return 'Email link sign-in is not enabled for this Firebase project. Enable Authentication → Sign-in method → Email/Password → Email link (passwordless sign-in), then send the invitation again.'
    case 'auth/unauthorized-continue-uri':
    case 'auth/invalid-continue-uri':
      return `Add ${typeof window === 'undefined' ? 'this site' : window.location.hostname} to Firebase → Authentication → Settings → Authorized domains, then send the invitation again.`
    case 'auth/invalid-email':
      return 'That email address is not valid.'
    default:
      return e instanceof Error ? e.message : 'Failed to send invitation'
  }
}

export const useInvitationsStore = defineStore('invitations', () => {
  const invitations = ref<Invitation[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)
  const loaded = ref(false)

  function fail(e: unknown, fallback: string): never {
    error.value = e instanceof Error ? e.message : fallback
    useToast().error(error.value)
    throw e
  }

  async function load(force = false) {
    if (loaded.value && !force) return
    loading.value = true
    error.value = null
    try {
      invitations.value = await useInvitationsRepository().fetchInvitations()
      loaded.value = true
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to load invitations'
      useToast().error(error.value)
    } finally {
      loading.value = false
    }
  }

  /**
   * Record the invitation, then email the sign-in link. Order matters: if the email fails to
   * send, the invitation still exists and can be re-sent, whereas a link with no invitation
   * behind it would sign someone in with no role at all.
   */
  async function invite(
    email: string,
    roleId: ChurchRoleId,
    invitedBy?: string,
    memberId?: string
  ) {
    const trimmed = email.trim()
    if (!trimmed) return
    saving.value = true
    error.value = null
    try {
      const created = await useInvitationsRepository().createInvitation(
        trimmed,
        roleId,
        invitedBy,
        memberId
      )
      const existing = invitations.value.findIndex((i) => i.email === created.email)
      if (existing === -1) invitations.value.push(created)
      else invitations.value[existing] = created

      const { $auth } = useNuxtApp()
      await sendSignInLinkToEmail($auth, created.email, {
        // Carries the address so /invite can prefill it; the page still asks the invitee to
        // confirm, since a link is not proof of who is holding it.
        url: `${window.location.origin}/invite?email=${encodeURIComponent(created.email)}`,
        handleCodeInApp: true,
      })
      recordAudit({
        action: 'invitation.send',
        targetId: created.email,
        targetLabel: created.email,
      })
      useToast().success(`Invitation sent to ${created.email}`)
    } catch (e: unknown) {
      // Not `fail()`: it prefers the raw Error message, which here is just the Firebase code.
      // The invitation row survives, so the invite can be re-sent once the setting is fixed.
      error.value = inviteErrorMessage(e)
      useToast().error(error.value)
      throw e
    } finally {
      saving.value = false
    }
  }

  async function revoke(email: string) {
    saving.value = true
    error.value = null
    try {
      await useInvitationsRepository().deleteInvitation(email)
      invitations.value = invitations.value.filter((i) => i.email !== email)
      recordAudit({ action: 'invitation.revoke', targetId: email, targetLabel: email })
      useToast().success('Invitation revoked')
    } catch (e: unknown) {
      fail(e, 'Failed to revoke invitation')
    } finally {
      saving.value = false
    }
  }

  /** Is the current URL a sign-in link Firebase can complete? */
  function isInviteLink(href: string): boolean {
    const { $auth } = useNuxtApp()
    return isSignInWithEmailLink($auth, href)
  }

  /**
   * Complete the sign-in and take up the invitation: create `users/{uid}` with the invited
   * role, then clear the invitation. Returns the role granted.
   *
   * The `users/{uid}` write is the step rules scrutinise — it is allowed only because an
   * invitation exists for this verified email and the role matches it.
   */
  async function claim(email: string, href: string): Promise<ChurchRoleId> {
    const { $auth } = useNuxtApp()
    saving.value = true
    error.value = null
    try {
      const credential = await signInWithEmailLink($auth, email.trim(), href)
      const repo = useInvitationsRepository()
      const invitation = await repo.fetchInvitation(credential.user.email ?? email)
      if (!invitation) {
        throw new Error(
          'No invitation found for this address. Ask a Super Admin to invite you again.'
        )
      }
      // Carrying memberId through is what ties the login to its nominal-roll record.
      await useUsersRepository().setUserRole(
        credential.user.uid,
        invitation.roleId,
        credential.user.email ?? invitation.email,
        invitation.memberId
      )
      // Best-effort: the role is granted either way, and a leftover invitation is harmless
      // because `users/{uid}` already exists so it can no longer be claimed.
      await repo.deleteInvitation(invitation.email).catch(() => {})
      recordAudit({
        action: 'invitation.claim',
        targetId: credential.user.uid,
        targetLabel: invitation.email,
      })
      return invitation.roleId
    } catch (e: unknown) {
      fail(e, 'Could not complete the invitation')
    } finally {
      saving.value = false
    }
  }

  return { invitations, loading, saving, error, loaded, load, invite, revoke, isInviteLink, claim }
})
