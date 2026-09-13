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

type Mode = 'password' | 'reset'
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

const heading = computed(() => (mode.value === 'reset' ? 'Reset your password' : 'Sign in'))

const subheading = computed(() =>
  mode.value === 'reset'
    ? 'We will email you a link to set a new password.'
    : 'Access the Congregation dashboard'
)

function onSubmit() {
  if (mode.value === 'password') return handleLogin()
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
          <template v-else>{{ submitting ? 'Sending…' : 'Send reset link' }}</template>
        </button>
      </form>

      <div class="flex flex-col items-center gap-2 border-t border-gray-100 pt-4 text-sm">
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
