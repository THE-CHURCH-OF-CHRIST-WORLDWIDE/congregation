<script setup lang="ts">
const form = reactive({ name: '', email: '', message: '' })
const submitted = ref(false)
const submitting = ref(false)

async function handleSubmit() {
  submitting.value = true
  await new Promise(r => setTimeout(r, 900))
  submitted.value = true
  submitting.value = false
}

const { el: sectionRef, isVisible } = useScrollReveal()
</script>

<template>
  <section id="contact" ref="sectionRef" class="py-20">
    <div class="mx-auto max-w-[900px] px-4 sm:px-6">

      <!-- Single split card -->
      <div
        class="overflow-hidden rounded-2xl bg-white"
        style="box-shadow: 0 4px 6px rgba(0,0,0,0.05), 0 10px 30px rgba(0,0,0,0.08); display: grid; grid-template-columns: 300px 1fr;"
      >

        <!-- ── Left panel: blue info ─────────────────────────────────── -->
        <div
          :class="['flex flex-col gap-5 p-7', 'reveal-left', isVisible && 'is-visible']"
          style="background-color: #026AA2;"
        >

          <!-- Map -->
          <div class="overflow-hidden rounded-xl" style="height: 160px;">
            <iframe
              src="https://maps.google.com/maps?q=7b+Esa+Atan+Extension,+Ikot+Ekpene,+Akwa+Ibom,+Nigeria&output=embed"
              width="100%"
              height="100%"
              style="border:0;"
              allowfullscreen
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
              title="Church location map"
            ></iframe>
          </div>

          <!-- Worship with us label -->
          <div>
            <p class="text-[13px] text-blue-200">Worship with us at</p>
            <p class="mt-1 text-[18px] font-bold leading-snug text-white">
              Church Of Christ, Esa Atan Congregation
            </p>
          </div>

          <!-- Contact details -->
          <div class="flex flex-col gap-4">
            <!-- Address -->
            <div class="flex items-start gap-2.5">
              <div class="mt-0.5 shrink-0 text-blue-200">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0z" />
                </svg>
              </div>
              <div>
                <p class="text-[12px] font-semibold text-white">Address</p>
                <p class="text-[12px] leading-snug text-blue-200">7B Esa Atan Extension, Uruk Uso, Ikot Ekpene.</p>
              </div>
            </div>

            <!-- Phone -->
            <div class="flex items-start gap-2.5">
              <div class="mt-0.5 shrink-0 text-blue-200">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25z" />
                </svg>
              </div>
              <div>
                <p class="text-[12px] font-semibold text-white">Phone Number</p>
                <p class="text-[12px] text-blue-200">(+234) 900 197 0700</p>
              </div>
            </div>

            <!-- Email -->
            <div class="flex items-start gap-2.5">
              <div class="mt-0.5 shrink-0 text-blue-200">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
              </div>
              <div>
                <p class="text-[12px] font-semibold text-white">Email</p>
                <p class="text-[12px] text-blue-200">churchofchristesa_atan@gmail.com</p>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Right panel: form ─────────────────────────────────────── -->
        <div :class="['p-8', 'reveal-right', 'delay-150', isVisible && 'is-visible']">
          <!-- Success state -->
          <Transition
            mode="out-in"
            enter-active-class="transition duration-500 ease-out"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
          <div v-if="submitted" class="flex h-full flex-col items-center justify-center py-12 text-center">
            <div class="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <Icon icon="heroicons:check-circle" class="h-7 w-7 text-green-600" />
            </div>
            <h3 class="mb-2 text-lg font-bold text-gray-900">Message Sent!</h3>
            <p class="text-sm text-gray-500">Thank you for reaching out. We'll be in touch soon.</p>
            <button class="mt-5 text-sm text-accent hover:underline" @click="submitted = false">
              Send another message
            </button>
          </div>

          <!-- Form -->
          <form v-else @submit.prevent="handleSubmit">
            <h2 class="mb-1 text-[22px] font-bold text-gray-900">Send Us A Message</h2>
            <p class="mb-6 text-[13px] leading-snug text-gray-500">
              Have questions? Need counselling? Want to learn more about God's word? We'd love to hear from you.
            </p>

            <div class="flex flex-col gap-4">
              <!-- Name -->
              <div>
                <label class="mb-1.5 block text-[13px] font-medium text-gray-700" for="cf-name">Name</label>
                <input
                  id="cf-name"
                  v-model="form.name"
                  type="text"
                  required
                  placeholder="Your full name"
                  class="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-[14px] text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>

              <!-- Email -->
              <div>
                <label class="mb-1.5 block text-[13px] font-medium text-gray-700" for="cf-email">Email</label>
                <input
                  id="cf-email"
                  v-model="form.email"
                  type="email"
                  required
                  placeholder="example@email.com"
                  class="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-[14px] text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>

              <!-- Message -->
              <div>
                <label class="mb-1.5 block text-[13px] font-medium text-gray-700" for="cf-message">Your Message</label>
                <textarea
                  id="cf-message"
                  v-model="form.message"
                  rows="4"
                  required
                  placeholder="How can we help you?"
                  class="w-full resize-none rounded-lg border border-gray-200 px-4 py-2.5 text-[14px] text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                ></textarea>
                <p class="mt-1 text-[12px] text-gray-400">Keep this simple of 500 words max.</p>
              </div>

              <button
                type="submit"
                :disabled="submitting"
                class="mt-1 w-full rounded-full bg-[#026AA2] py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
              >
                {{ submitting ? 'Sending…' : 'Send message' }}
              </button>
            </div>
          </form>
          </Transition>
        </div>

      </div>
    </div>
  </section>
</template>
