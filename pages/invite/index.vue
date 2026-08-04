<script setup lang="ts">
definePageMeta({ layout: 'default' })
useSeoMeta({ title: 'Accept your invitation', robots: 'noindex' })

const route = useRoute()
const invitationsStore = useInvitationsStore()
const authStore = useAuthStore()
const rolesStore = useRolesStore()

/**
 * The invitee arrives here from the emailed sign-in link. They confirm their address before we
 * complete the sign-in: holding a link is not proof of who you are, and Firebase's own guidance
 * is to ask rather than trust an address carried in the URL.
 */
const email = ref(typeof route.query.email === 'string' ? route.query.email : '')
const state = ref<'confirm' | 'working' | 'done' | 'error'>('confirm')
const message = ref('')
const grantedRole = ref<string | null>(null)

const isLink = ref(false)

onMounted(() => {
  isLink.value = invitationsStore.isInviteLink(window.location.href)
  if (!isLink.value) {
    state.value = 'error'
    message.value =
      'This page completes an emailed invitation, and this does not look like an invitation link. Open the link from your invitation email, or ask for a new one.'
  }
})

async function accept() {
  if (!email.value.trim()) {
    message.value = 'Enter the email address your invitation was sent to.'
    return
  }
  state.value = 'working'
  message.value = ''
  try {
    const roleId = await invitationsStore.claim(email.value, window.location.href)
    grantedRole.value = rolesStore.roleById(roleId)?.name ?? roleId
    state.value = 'done'
  } catch (e: unknown) {
    state.value = 'error'
    message.value =
      e instanceof Error ? e.message : 'Could not complete the invitation. Ask for a new one.'
  }
}

async function goToDashboard() {
  // The role was just written; refresh it so the dashboard does not show the no-role banner.
  await authStore.whenReady()
  await navigateTo('/admin')
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 px-4">
    <div class="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-sm">
      <div class="text-center">
        <h1 class="text-2xl font-semibold text-gray-900">Accept your invitation</h1>
        <p class="mt-1 text-sm text-gray-500">
          Confirm your email address to finish setting up your access.
        </p>
      </div>

      <!-- Confirm -->
      <form
        v-if="state === 'confirm' || state === 'working'"
        class="space-y-4"
        @submit.prevent="accept"
      >
        <Input
          v-model="email"
          label="Email address"
          type="email"
          placeholder="you@example.com"
          :disabled="!isLink || state === 'working'"
          :error="message"
        />
        <Button
          type="submit"
          class="w-full"
          :loading="state === 'working'"
          :disabled="!isLink"
          @click="accept"
        >
          Accept invitation
        </Button>
      </form>

      <!-- Done -->
      <div v-else-if="state === 'done'" class="space-y-4 text-center">
        <div
          class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600"
        >
          <Icon icon="mdi:check" class="text-2xl" />
        </div>
        <p class="text-sm text-gray-600">
          You are signed in as <span class="font-medium text-gray-900">{{ email }}</span>
          <template v-if="grantedRole">
            with the
            <span class="font-medium text-gray-900">{{ grantedRole }}</span> role </template
          >.
        </p>
        <Button class="w-full" @click="goToDashboard">Go to the dashboard</Button>
      </div>

      <!-- Error -->
      <div v-else class="space-y-4">
        <div class="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-800">
          <Icon icon="mdi:alert-circle-outline" class="mt-0.5 shrink-0" />
          <p>{{ message }}</p>
        </div>
        <NuxtLink to="/login" class="block text-center text-sm text-blue-600 hover:underline">
          Go to sign in
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
