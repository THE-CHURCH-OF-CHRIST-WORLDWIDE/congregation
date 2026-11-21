<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

const authStore = useAuthStore()
const route = useRoute()
// Presentation only: the navbar already loads the church settings; this just reads the name.
const settingsStore = useChurchSettingsStore()

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
  <div class="grid min-h-[calc(100svh-var(--nav-h))] bg-surface md:grid-cols-12">
    <!-- Forest field: the church's name, set large -->
    <section
      class="field-forest relative flex flex-col justify-between gap-10 overflow-hidden px-[var(--site-gutter)] py-10 md:col-span-5 md:py-16 lg:px-14 lg:py-20"
      aria-hidden="true"
    >
      <div
        class="flex size-12 items-center justify-center rounded-full border border-champagne/40 text-champagne"
      >
        <Icon icon="mdi:church" class="text-xl" />
      </div>
      <div>
        <p class="t-h1 max-w-[12ch] text-on-night">
          {{ settingsStore.settings.name || 'Congregation' }}
        </p>
        <div class="mt-8 h-px w-16 bg-champagne/70"></div>
        <p
          v-if="settingsStore.settings.address"
          class="mt-5 max-w-xs text-sm leading-relaxed text-on-night-muted"
        >
          {{ settingsStore.settings.address }}
        </p>
      </div>
    </section>

    <!-- The form, on ivory -->
    <section
      class="flex items-center px-[var(--site-gutter)] py-12 md:col-span-7 md:py-16 lg:px-20"
    >
      <div class="w-full max-w-md">
        <h1 class="t-h2 text-ink">{{ heading }}</h1>
        <p class="mt-3 text-base leading-relaxed text-ink-muted">{{ subheading }}</p>

        <form class="mt-10 space-y-8" @submit.prevent="onSubmit">
          <div>
            <label for="email" class="field-label">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              autocomplete="email"
              required
              class="field-input"
            />
          </div>

          <div v-if="mode === 'password'">
            <label for="password" class="field-label">Password</label>
            <input
              id="password"
              v-model="password"
              type="password"
              autocomplete="current-password"
              required
              class="field-input"
            />
          </div>

          <p
            v-if="authStore.error"
            class="flex items-start gap-2 rounded-sm border border-error/25 bg-error-soft px-3 py-2.5 text-sm text-error"
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
            class="block rounded-sm border border-success/25 bg-success-soft px-3 py-2.5 text-sm text-success"
          >
            {{ notice }}
          </output>

          <button type="submit" :disabled="submitting" class="btn btn-primary min-h-13 w-full">
            <Icon v-if="submitting" icon="mdi:loading" class="animate-spin" aria-hidden="true" />
            <template v-if="mode === 'password'">
              {{ submitting ? 'Signing in…' : 'Sign in' }}
            </template>
            <template v-else>{{ submitting ? 'Sending…' : 'Send reset link' }}</template>
          </button>
        </form>

        <div class="mt-8 flex flex-col items-start gap-1 border-t border-rule pt-5 text-sm">
          <button
            v-if="mode !== 'reset'"
            type="button"
            class="-mx-2 min-h-10 rounded-sm px-2 text-ink-muted underline-offset-4 transition-colors duration-150 hover:text-primary-ink hover:underline"
            @click="switchTo('reset')"
          >
            Forgot your password?
          </button>
          <button
            v-if="mode !== 'password'"
            type="button"
            class="-mx-2 min-h-10 rounded-sm px-2 text-ink-muted underline-offset-4 transition-colors duration-150 hover:text-primary-ink hover:underline"
            @click="switchTo('password')"
          >
            Back to password sign-in
          </button>
        </div>
      </div>
    </section>
  </div>
</template>
