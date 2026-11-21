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

// Name, address, phone and email all come from Settings → General.
const settingsStore = useChurchSettingsStore()

onMounted(() => settingsStore.load())
</script>

<template>
  <section id="contact" class="section scroll-mt-20 bg-surface">
    <div class="site-container grid gap-16 lg:grid-cols-12 lg:gap-8">
      <!-- ── Left: the invitation and the church's details ───────────── -->
      <div class="lg:col-span-5">
        <h2 class="t-h1 text-secondary">
          <SplitReveal text="Send Us A Message" />
        </h2>
        <p v-reveal.150 class="t-lede mt-6 max-w-md">
          Have questions? Need counselling? Want to learn more about God's word? We'd love to hear
          from you.
        </p>

        <dl v-reveal.250 class="mt-12 border-t border-rule">
          <div class="grid grid-cols-[7rem_minmax(0,1fr)] gap-4 border-b border-rule py-5">
            <dt class="field-label pt-1">Worship at</dt>
            <dd class="font-display text-xl leading-snug text-ink">
              {{ settingsStore.settings.name }}
            </dd>
          </div>
          <div class="grid grid-cols-[7rem_minmax(0,1fr)] gap-4 border-b border-rule py-5">
            <dt class="field-label pt-1">Address</dt>
            <dd class="text-base leading-relaxed text-ink">
              {{ settingsStore.settings.address }}
            </dd>
          </div>
          <div class="grid grid-cols-[7rem_minmax(0,1fr)] gap-4 border-b border-rule py-5">
            <dt class="field-label pt-1">Phone Number</dt>
            <dd class="num text-base text-ink">{{ settingsStore.settings.phone }}</dd>
          </div>
          <div class="grid grid-cols-[7rem_minmax(0,1fr)] gap-4 border-b border-rule py-5">
            <dt class="field-label pt-1">Email</dt>
            <dd class="text-base break-all text-ink">{{ settingsStore.settings.email }}</dd>
          </div>
        </dl>

        <!-- Map — MapEmbed defaults to the address held in Settings -->
        <div
          v-reveal="{ type: 'unveil', delay: 300 }"
          class="mt-10 overflow-hidden bg-surface-sunken grayscale-[0.35] sepia-[0.15]"
        >
          <MapEmbed height="220px" />
        </div>
      </div>

      <!-- ── Right: the form ─────────────────────────────────────────── -->
      <div class="lg:col-span-6 lg:col-start-7">
        <div v-reveal.200 class="border border-rule bg-surface-muted p-6 sm:p-10 lg:p-14">
          <!-- Success state -->
          <Transition
            mode="out-in"
            enter-active-class="transition duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
            enter-from-class="opacity-0 translate-y-3"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <div
              v-if="submitted"
              class="flex min-h-[28rem] flex-col items-start justify-center"
              role="status"
            >
              <span
                class="mb-8 flex size-14 items-center justify-center rounded-full border border-success/40 text-success"
              >
                <Icon icon="mdi:check" class="h-7 w-7" />
              </span>
              <h3 class="t-h2 text-ink">Message Sent!</h3>
              <p class="t-lede mt-4 max-w-sm">
                Thank you for reaching out. We'll be in touch soon.
              </p>
              <button class="link-line mt-8 text-base text-accent" @click="submitted = false">
                <span class="link-text">Send another message</span>
              </button>
            </div>

            <!-- Form -->
            <form v-else class="flex flex-col gap-9" @submit.prevent="handleSubmit">
              <!-- Name -->
              <div>
                <label class="field-label" for="cf-name">Name</label>
                <input
                  id="cf-name"
                  v-model="form.name"
                  type="text"
                  required
                  placeholder="Your full name"
                  class="field-input"
                />
              </div>

              <div class="grid gap-9 sm:grid-cols-2 sm:gap-6">
                <!-- Email -->
                <div>
                  <label class="field-label" for="cf-email">Email</label>
                  <input
                    id="cf-email"
                    v-model="form.email"
                    type="email"
                    required
                    placeholder="example@email.com"
                    class="field-input"
                  />
                </div>

                <!-- Phone -->
                <div>
                  <label class="field-label" for="cf-phone">Phone Number</label>
                  <input
                    id="cf-phone"
                    v-model="form.phone"
                    type="tel"
                    autocomplete="tel"
                    required
                    placeholder="+234 800 000 0000"
                    class="field-input"
                  />
                </div>
              </div>

              <!-- Message -->
              <div>
                <label class="field-label" for="cf-message">Your Message</label>
                <textarea
                  id="cf-message"
                  v-model="form.message"
                  rows="5"
                  required
                  placeholder="How can we help you?"
                  class="field-input resize-y leading-relaxed"
                ></textarea>
                <p class="mt-2 text-sm text-ink-subtle">Please keep it under 500 words.</p>
              </div>

              <p
                v-if="error"
                role="alert"
                class="flex items-start gap-2 border border-error/30 bg-error-soft px-4 py-3 text-base text-error"
              >
                <Icon icon="mdi:alert-circle-outline" class="mt-0.5 h-5 w-5 shrink-0" />
                <span>{{ error }}</span>
              </p>

              <button
                type="submit"
                :disabled="messagesStore.submitting"
                class="btn btn-primary min-h-14 w-full text-base sm:w-auto sm:self-start sm:px-10"
              >
                <Icon
                  v-if="messagesStore.submitting"
                  icon="mdi:loading"
                  class="h-5 w-5 animate-spin"
                  aria-hidden="true"
                />
                {{ messagesStore.submitting ? 'Sending…' : 'Send message' }}
                <Icon
                  v-if="!messagesStore.submitting"
                  icon="mdi:arrow-right"
                  class="btn-arrow h-5 w-5"
                />
              </button>
            </form>
          </Transition>
        </div>
      </div>
    </div>
  </section>
</template>
