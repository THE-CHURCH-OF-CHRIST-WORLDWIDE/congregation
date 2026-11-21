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
  <div
    class="flex min-h-[calc(100vh-4.5rem)] items-center justify-center bg-canvas px-4 py-12 sm:py-16"
  >
    <div
      class="grid w-full max-w-md overflow-hidden rounded-lg border border-rule bg-surface shadow-md md:max-w-3xl md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
    >
      <!-- Bookcloth panel: the register's binding -->
      <div class="bookcloth flex flex-col justify-between gap-6 px-6 py-6 md:px-8 md:py-10">
        <Icon
          icon="mdi:book-account-outline"
          class="size-9 text-white/85 md:size-11"
          aria-hidden="true"
        />
        <div>
          <h1 class="font-display text-2xl leading-tight font-bold text-white md:text-3xl">
            {{ heading }}
          </h1>
          <p class="mt-2 text-sm leading-relaxed text-white/80 md:text-base">{{ subheading }}</p>
        </div>
      </div>

      <div class="px-6 py-7 md:px-8 md:py-10">
        <form class="space-y-5" @submit.prevent="onSubmit">
          <div>
            <label for="email" class="block text-sm font-medium text-ink">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              autocomplete="email"
              required
              class="mt-1.5 block min-h-11 w-full rounded-md border border-rule-strong bg-surface px-3 py-2 text-base text-ink shadow-xs outline-none transition-[border-color,box-shadow] duration-150 hover:border-ink-subtle focus:border-primary focus:ring-3 focus:ring-primary/15 sm:min-h-10 sm:text-sm"
            />
          </div>

          <div v-if="mode === 'password'">
            <label for="password" class="block text-sm font-medium text-ink">Password</label>
            <input
              id="password"
              v-model="password"
              type="password"
              autocomplete="current-password"
              required
              class="mt-1.5 block min-h-11 w-full rounded-md border border-rule-strong bg-surface px-3 py-2 text-base text-ink shadow-xs outline-none transition-[border-color,box-shadow] duration-150 hover:border-ink-subtle focus:border-primary focus:ring-3 focus:ring-primary/15 sm:min-h-10 sm:text-sm"
            />
          </div>

          <p
            v-if="authStore.error"
            class="flex items-start gap-2 rounded-md border border-error/25 bg-error-soft px-3 py-2.5 text-sm text-error"
          >
            <Icon
              icon="mdi:alert-circle-outline"
              class="mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            {{ authStore.error }}
          </p>
          <!-- <output> carries an implicit status role and is the semantic element for a result. -->
          <output
            v-else-if="notice"
            class="block rounded-md border border-success/25 bg-success-soft px-3 py-2.5 text-sm text-success"
          >
            {{ notice }}
          </output>

          <button
            type="submit"
            :disabled="submitting"
            class="flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-on-primary shadow-xs transition-colors duration-150 hover:bg-primary-hover active:bg-primary-active disabled:cursor-not-allowed disabled:opacity-55"
          >
            <Icon v-if="submitting" icon="mdi:loading" class="animate-spin" aria-hidden="true" />
            <template v-if="mode === 'password'">
              {{ submitting ? 'Signing in…' : 'Sign in' }}
            </template>
            <template v-else>{{ submitting ? 'Sending…' : 'Send reset link' }}</template>
          </button>
        </form>

        <div class="mt-6 flex flex-col items-center gap-1 border-t border-rule pt-4 text-sm">
          <button
            v-if="mode !== 'reset'"
            type="button"
            class="min-h-10 rounded-sm px-2 text-ink-muted underline-offset-3 transition-colors duration-150 hover:text-primary-ink hover:underline"
            @click="switchTo('reset')"
          >
            Forgot your password?
          </button>
          <button
            v-if="mode !== 'password'"
            type="button"
            class="min-h-10 rounded-sm px-2 text-ink-muted underline-offset-3 transition-colors duration-150 hover:text-primary-ink hover:underline"
            @click="switchTo('password')"
          >
            Back to password sign-in
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
