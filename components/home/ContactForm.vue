<script setup lang="ts">
const form = reactive({
  name: '',
  email: '',
  subject: '',
  message: '',
})

const submitted = ref(false)
const submitting = ref(false)

async function handleSubmit() {
  submitting.value = true
  // Simulate submission
  await new Promise(r => setTimeout(r, 1000))
  submitted.value = true
  submitting.value = false
}
</script>

<template>
  <section id="contact" class="py-20">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <SectionHeader
        title="Send Us a Message"
        subtitle="We'd love to hear from you. Reach out and our team will respond shortly."
      />

      <div class="grid gap-10 lg:grid-cols-2">
        <!-- Form -->
        <div class="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          <div v-if="submitted" class="flex flex-col items-center justify-center py-12 text-center">
            <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <Icon icon="heroicons:check-circle" class="h-8 w-8 text-green-600" />
            </div>
            <h3 class="font-serif text-xl font-bold text-[#1E3A5F] mb-2">Message Sent!</h3>
            <p class="text-gray-500 text-sm">Thank you for reaching out. We'll be in touch soon.</p>
            <button
              @click="submitted = false"
              class="mt-6 text-sm text-[#2563EB] hover:underline"
            >
              Send another message
            </button>
          </div>

          <form v-else @submit.prevent="handleSubmit" class="space-y-5">
            <div class="grid gap-5 sm:grid-cols-2">
              <div>
                <label class="mb-1.5 block text-xs font-medium text-gray-700" for="contact-name">Full Name</label>
                <input
                  id="contact-name"
                  v-model="form.name"
                  type="text"
                  required
                  placeholder="Your full name"
                  class="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition"
                />
              </div>
              <div>
                <label class="mb-1.5 block text-xs font-medium text-gray-700" for="contact-email">Email Address</label>
                <input
                  id="contact-email"
                  v-model="form.email"
                  type="email"
                  required
                  placeholder="your@email.com"
                  class="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition"
                />
              </div>
            </div>
            <div>
              <label class="mb-1.5 block text-xs font-medium text-gray-700" for="contact-subject">Subject</label>
              <input
                id="contact-subject"
                v-model="form.subject"
                type="text"
                required
                placeholder="What is this regarding?"
                class="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition"
              />
            </div>
            <div>
              <label class="mb-1.5 block text-xs font-medium text-gray-700" for="contact-message">Message</label>
              <textarea
                id="contact-message"
                v-model="form.message"
                rows="5"
                required
                placeholder="Write your message here…"
                class="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition resize-none"
              />
            </div>
            <button
              type="submit"
              :disabled="submitting"
              class="w-full rounded-full bg-[#2563EB] py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-60"
              aria-label="Send message"
            >
              <span v-if="submitting">Sending…</span>
              <span v-else>Send Message</span>
            </button>
          </form>
        </div>

        <!-- Address + map -->
        <div class="flex flex-col gap-6">
          <div class="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
            <h3 class="font-serif font-bold text-[#1E3A5F] text-lg mb-5">Visit Us</h3>
            <div class="space-y-4">
              <div class="flex items-start gap-3">
                <div class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#1E3A5F]/10">
                  <Icon icon="heroicons:map-pin" class="h-4 w-4 text-[#1E3A5F]" />
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-700">Address</p>
                  <p class="text-sm text-gray-500">7b Esa Atan, Ekot Ekpene<br>Akwa Ibom State, Nigeria</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#1E3A5F]/10">
                  <Icon icon="heroicons:clock" class="h-4 w-4 text-[#1E3A5F]" />
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-700">Sunday Worship</p>
                  <p class="text-sm text-gray-500">Every Sunday · 9:00 AM</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#1E3A5F]/10">
                  <Icon icon="heroicons:envelope" class="h-4 w-4 text-[#1E3A5F]" />
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-700">Email</p>
                  <p class="text-sm text-gray-500">info@churchofchrist.org</p>
                </div>
              </div>
            </div>
          </div>

          <MapEmbed address="7b Esa Atan, Ekot Ekpene, Akwa Ibom, Nigeria" height="220px" />
        </div>
      </div>
    </div>
  </section>
</template>
