<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

const authStore = useAuthStore()
const route = useRoute()

const email = ref(typeof route.query.email === 'string' ? route.query.email : '')
const password = ref('')
const submitting = ref(false)
const notice = ref('')

/**
 * Three ways in, because the accounts here are not all alike.
 *
 * Invited accounts are created by email link and have no password at all, so a password-only
 * form locked them out the moment they signed out or opened the dashboard on another device.
 *
 *   password  — the normal form
 *   link      — email a one-time sign-in link, for accounts with no password
 *   reset     — email a reset link, which is also how a link-only account sets a password
 */
type Mode = 'password' | 'link' | 'reset' | 'completing'
const mode = ref<Mode>('password')

/**
 * Where to land after signing in. Only same-site paths are accepted — taking
 * `?redirect=` at face value would turn this form into an open redirect that
 * could bounce users to an attacker's page after a real login.
 */
const destination = computed(() => {
  const target = route.query.redirect
  if (typeof target !== 'string') return '/admin'
  // Must be a root-relative path, and not protocol-relative ("//evil.com").
  if (!target.startsWith('/') || target.startsWith('//')) return '/admin'
  return target
})

onMounted(async () => {
  // Arriving on an emailed sign-in link: confirm the address, then complete it. Firebase's own
  // guidance is to ask rather than trust an address carried in the URL.
  if (authStore.isLoginLink(window.location.href)) {
    mode.value = 'completing'
    return
  }

  await authStore.whenReady()
  if (authStore.isAuthenticated) await navigateTo(destination.value, { replace: true })
})

async function handleLogin() {
  submitting.value = true
  try {
    await authStore.login(email.value, password.value)
    await navigateTo(destination.value, { replace: true })
  } catch {
    // The store surfaces the reason via `authStore.error`, rendered below.
  } finally {
    submitting.value = false
  }
}

async function completeLink() {
  submitting.value = true
  try {
    await authStore.completeLinkSignIn(email.value, window.location.href)
    await navigateTo(destination.value, { replace: true })
  } catch {
    // Shown via authStore.error — often just the wrong address for this link.
  } finally {
    submitting.value = false
  }
}

async function sendLink() {
  submitting.value = true
  notice.value = ''
  try {
    await authStore.sendLoginLink(email.value)
    notice.value = `A sign-in link is on its way to ${email.value}. It can only be used once.`
  } catch {
    // Shown via authStore.error.
  } finally {
    submitting.value = false
  }
}

async function sendReset() {
  submitting.value = true
  notice.value = ''
  try {
    await authStore.sendReset(email.value)
    // Worded to reveal nothing about which addresses have accounts.
    notice.value = `If ${email.value} has an account, a password reset link is on its way.`
  } catch {
    // Shown via authStore.error.
  } finally {
    submitting.value = false
  }
}

function switchTo(next: Mode) {
  mode.value = next
  notice.value = ''
  authStore.error = null
}

const heading = computed(() => {
  switch (mode.value) {
    case 'completing':
      return 'Confirm your email'
    case 'link':
      return 'Email me a sign-in link'
    case 'reset':
      return 'Reset your password'
    default:
      return 'Sign in'
  }
})

const subheading = computed(() => {
  switch (mode.value) {
    case 'completing':
      return 'Confirm the address this link was sent to.'
    case 'link':
      return 'Use this if you were invited and have no password.'
    case 'reset':
      return 'We will email you a link to set a new password.'
    default:
      return 'Access the Congregation dashboard'
  }
})

function onSubmit() {
  if (mode.value === 'password') return handleLogin()
  if (mode.value === 'completing') return completeLink()
  if (mode.value === 'link') return sendLink()
  return sendReset()
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 px-4">
    <div class="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-sm">
      <div class="text-center">
        <h1 class="text-2xl font-semibold text-gray-900">{{ heading }}</h1>
        <p class="mt-1 text-sm text-gray-500">{{ subheading }}</p>
      </div>

      <form class="space-y-4" @submit.prevent="onSubmit">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            autocomplete="email"
            required
            class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div v-if="mode === 'password'">
          <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            autocomplete="current-password"
            required
            class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <p v-if="authStore.error" class="text-sm text-red-600">{{ authStore.error }}</p>
        <!-- <output> carries an implicit status role and is the semantic element for a result. -->
        <output
          v-else-if="notice"
          class="block rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800"
        >
          {{ notice }}
        </output>

        <button
          type="submit"
          :disabled="submitting"
          class="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          <Icon v-if="submitting" icon="mdi:loading" class="animate-spin" />
          <template v-if="mode === 'password'">
            {{ submitting ? 'Signing in…' : 'Sign in' }}
          </template>
          <template v-else-if="mode === 'completing'">
            {{ submitting ? 'Signing in…' : 'Continue' }}
          </template>
          <template v-else>{{ submitting ? 'Sending…' : 'Send link' }}</template>
        </button>
      </form>

      <!-- Alternatives. Hidden while completing a link, where there is only one thing to do. -->
      <div
        v-if="mode !== 'completing'"
        class="flex flex-col items-center gap-2 border-t border-gray-100 pt-4 text-sm"
      >
        <button
          v-if="mode !== 'link'"
          type="button"
          class="text-blue-600 hover:underline"
          @click="switchTo('link')"
        >
          Email me a sign-in link instead
        </button>
        <button
          v-if="mode !== 'reset'"
          type="button"
          class="text-gray-500 hover:text-gray-900 hover:underline"
          @click="switchTo('reset')"
        >
          Forgot your password?
        </button>
        <button
          v-if="mode !== 'password'"
          type="button"
          class="text-gray-500 hover:text-gray-900 hover:underline"
          @click="switchTo('password')"
        >
          Back to password sign-in
        </button>
      </div>
    </div>
  </div>
</template>
