<script setup lang="ts">
const form = reactive({ name: '', email: '', phone: '', message: '' })
const submitted = ref(false)
const error = ref('')

const messagesStore = useMessagesStore()

/**
 * Sends the message to Firestore, where staff read it in Admin → Messages.
 *
 * This used to be a 900ms `setTimeout` followed by "Message Sent!" — nothing was ever sent
 * anywhere. On failure the form now stays on screen with what was typed still in it, because
 * clearing it would lose a message the visitor believes they sent.
 */
async function handleSubmit() {
  error.value = ''
  try {
    await messagesStore.submit({
      name: form.name,
      email: form.email,
      phone: form.phone,
      message: form.message,
    })
    submitted.value = true
    Object.assign(form, { name: '', email: '', phone: '', message: '' })
  } catch {
    error.value =
      messagesStore.error ?? 'Your message could not be sent. Please try again, or call us.'
  }
}

const { el: sectionRef, isVisible } = useScrollReveal()

// Name, address, phone and email all come from Settings → General.
const settingsStore = useChurchSettingsStore()

onMounted(() => settingsStore.load())
</script>

<template>
  <section id="contact" ref="sectionRef" class="scroll-mt-20 bg-surface py-16 md:py-24">
    <div class="mx-auto max-w-5xl px-5 sm:px-6 lg:px-8">
      <!-- Single split panel: bookcloth details beside the ledger-page form -->
      <div
        class="grid overflow-hidden rounded-lg border border-rule bg-surface shadow-sm md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
      >
        <!-- ── Left panel: details on bookcloth ──────────────────────── -->
        <div
          :class="[
            'bookcloth flex flex-col gap-6 p-6 sm:p-8',
            'reveal-left',
            isVisible && 'is-visible',
          ]"
        >
          <!-- Map — MapEmbed defaults to the address held in Settings -->
          <div class="overflow-hidden rounded-md ring-1 ring-white/20">
            <MapEmbed height="180px" />
          </div>

          <!-- Worship with us label -->
          <div>
            <p class="text-base text-white/80">Worship with us at</p>
            <p class="mt-1 font-display text-xl leading-snug font-semibold text-white">
              {{ settingsStore.settings.name }}
            </p>
          </div>

          <!-- Contact details -->
          <div class="flex flex-col gap-5 border-t border-white/20 pt-5">
            <!-- Address -->
            <div class="flex items-start gap-3">
              <div class="mt-0.5 shrink-0 text-white/75">
                <svg
                  class="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0z"
                  />
                </svg>
              </div>
              <div class="min-w-0">
                <p class="text-sm font-semibold tracking-wide text-white">Address</p>
                <p class="mt-0.5 text-base leading-snug text-white/85">
                  {{ settingsStore.settings.address }}
                </p>
              </div>
            </div>

            <!-- Phone -->
            <div class="flex items-start gap-3">
              <div class="mt-0.5 shrink-0 text-white/75">
                <svg
                  class="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25z"
                  />
                </svg>
              </div>
              <div class="min-w-0">
                <p class="text-sm font-semibold tracking-wide text-white">Phone Number</p>
                <p class="mt-0.5 text-base leading-snug text-white/85 num">
                  {{ settingsStore.settings.phone }}
                </p>
              </div>
            </div>

            <!-- Email -->
            <div class="flex items-start gap-3">
              <div class="mt-0.5 shrink-0 text-white/75">
                <svg
                  class="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                  />
                </svg>
              </div>
              <div class="min-w-0">
                <p class="text-sm font-semibold tracking-wide text-white">Email</p>
                <p class="mt-0.5 text-base leading-snug text-white/85 break-all">
                  {{ settingsStore.settings.email }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Right panel: form ─────────────────────────────────────── -->
        <div
          :class="['p-6 sm:p-8 lg:p-10', 'reveal-right', 'delay-150', isVisible && 'is-visible']"
        >
          <!-- Success state -->
          <Transition
            mode="out-in"
            enter-active-class="transition duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
            enter-from-class="opacity-0 translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <div
              v-if="submitted"
              class="flex h-full flex-col items-center justify-center py-12 text-center"
            >
              <div
                class="mb-5 flex size-14 items-center justify-center rounded-full bg-success-soft"
              >
                <Icon icon="mdi:check-circle-outline" class="h-8 w-8 text-success" />
              </div>
              <h3 class="mb-2 font-display text-2xl font-bold text-ink">Message Sent!</h3>
              <p class="max-w-sm text-base leading-relaxed text-ink-muted">
                Thank you for reaching out. We'll be in touch soon.
              </p>
              <button
                class="mt-6 inline-flex min-h-11 items-center text-base font-semibold text-accent underline underline-offset-3 hover:text-primary-ink"
                @click="submitted = false"
              >
                Send another message
              </button>
            </div>

            <!-- Form -->
            <form v-else @submit.prevent="handleSubmit">
              <div class="mb-8">
                <h2
                  class="font-display text-[1.75rem] leading-[1.15] font-bold text-secondary md:text-[2rem]"
                >
                  Send Us A Message
                </h2>
                <p class="mt-3 text-base leading-relaxed text-ink-muted">
                  Have questions? Need counselling? Want to learn more about God's word? We'd love
                  to hear from you.
                </p>
              </div>

              <div class="flex flex-col gap-5">
                <!-- Name -->
                <div>
                  <label class="mb-1.5 block text-base font-medium text-ink" for="cf-name"
                    >Name</label
                  >
                  <input
                    id="cf-name"
                    v-model="form.name"
                    type="text"
                    required
                    placeholder="Your full name"
                    class="w-full min-h-12 rounded-md border border-rule-strong bg-surface px-3.5 py-2.5 text-base text-ink shadow-xs outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-ink-subtle hover:border-ink-subtle focus:border-primary focus:ring-3 focus:ring-primary/15"
                  />
                </div>

                <!-- Email -->
                <div>
                  <label class="mb-1.5 block text-base font-medium text-ink" for="cf-email"
                    >Email</label
                  >
                  <input
                    id="cf-email"
                    v-model="form.email"
                    type="email"
                    required
                    placeholder="example@email.com"
                    class="w-full min-h-12 rounded-md border border-rule-strong bg-surface px-3.5 py-2.5 text-base text-ink shadow-xs outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-ink-subtle hover:border-ink-subtle focus:border-primary focus:ring-3 focus:ring-primary/15"
                  />
                </div>

                <!-- Phone -->
                <div>
                  <label class="mb-1.5 block text-base font-medium text-ink" for="cf-phone"
                    >Phone Number</label
                  >
                  <input
                    id="cf-phone"
                    v-model="form.phone"
                    type="tel"
                    autocomplete="tel"
                    required
                    placeholder="+234 800 000 0000"
                    class="w-full min-h-12 rounded-md border border-rule-strong bg-surface px-3.5 py-2.5 text-base text-ink shadow-xs outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-ink-subtle hover:border-ink-subtle focus:border-primary focus:ring-3 focus:ring-primary/15"
                  />
                </div>

                <!-- Message -->
                <div>
                  <label class="mb-1.5 block text-base font-medium text-ink" for="cf-message"
                    >Your Message</label
                  >
                  <textarea
                    id="cf-message"
                    v-model="form.message"
                    rows="5"
                    required
                    placeholder="How can we help you?"
                    class="w-full min-h-12 rounded-md border border-rule-strong bg-surface px-3.5 py-2.5 text-base text-ink shadow-xs outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-ink-subtle hover:border-ink-subtle focus:border-primary focus:ring-3 focus:ring-primary/15 resize-y leading-relaxed"
                  ></textarea>
                  <p class="mt-1.5 text-sm text-ink-subtle">Please keep it under 500 words.</p>
                </div>

                <p
                  v-if="error"
                  role="alert"
                  class="flex items-start gap-2 rounded-md border border-error/25 bg-error-soft px-4 py-3 text-base text-error"
                >
                  <Icon icon="mdi:alert-circle-outline" class="mt-0.5 h-5 w-5 shrink-0" />
                  <span>{{ error }}</span>
                </p>

                <button
                  type="submit"
                  :disabled="messagesStore.submitting"
                  class="mt-1 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-primary px-6 text-base font-semibold text-on-primary shadow-xs transition-colors duration-150 hover:bg-primary-hover active:bg-primary-active disabled:cursor-not-allowed disabled:opacity-55"
                >
                  {{ messagesStore.submitting ? 'Sending…' : 'Send message' }}
                </button>
              </div>
            </form>
          </Transition>
        </div>
      </div>
    </div>
  </section>
</template>
