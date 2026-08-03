<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

const authStore = useAuthStore()
const route = useRoute()

const email = ref('')
const password = ref('')
const submitting = ref(false)

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

// Already signed in? Nothing to do here.
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
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 px-4">
    <div class="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-sm">
      <div class="text-center">
        <h1 class="text-2xl font-semibold text-gray-900">Sign in</h1>
        <p class="mt-1 text-sm text-gray-500">Access the Congregation dashboard</p>
      </div>

      <form class="space-y-4" @submit.prevent="handleLogin">
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

        <div>
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

        <p v-if="authStore.error" class="text-sm text-red-600">
          {{ authStore.error }}
        </p>

        <button
          type="submit"
          :disabled="submitting"
          class="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          <Icon v-if="submitting" icon="mdi:loading" class="animate-spin" />
          {{ submitting ? 'Signing in...' : 'Sign in' }}
        </button>
      </form>
    </div>
  </div>
</template>
