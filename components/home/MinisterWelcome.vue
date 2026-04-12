<template>
  <section id="welcome" class="bg-[#F8F9FA] py-20">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <!-- Welcome card -->
      <div class="grid gap-8 overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 lg:grid-cols-2">
        <!-- Minister letter -->
        <div class="p-8 lg:p-12">
          <p class="mb-2 text-xs font-bold uppercase tracking-widest text-[#2563EB]">
            A Welcome Letter from Our Minister
          </p>
          <h2 class="font-serif text-3xl font-bold text-[#1E3A5F] mb-6">
            Grace and Peace to You
          </h2>

          <div class="flex items-start gap-4 mb-6">
            <img
              src="https://picsum.photos/seed/minister/200/200"
              alt="Minister photo"
              loading="lazy"
              class="h-16 w-16 rounded-full object-cover border-2 border-[#2563EB] shrink-0"
            />
            <div>
              <p class="font-semibold text-[#1E3A5F]">Bro. Emmanuel Okon</p>
              <p class="text-sm text-gray-500">Evangelist & Preacher</p>
            </div>
          </div>

          <div class="space-y-4 text-sm text-gray-600 leading-relaxed">
            <p>
              On behalf of the entire congregation of the Church of Christ in Ekot Ekpene, I extend to you a most hearty welcome. We are a people gathered in the name of Jesus Christ alone, seeking to honour God according to the pattern of the New Testament church.
            </p>
            <p>
              Our doors are open to every soul who hungers and thirsts after righteousness. Whether you are seeking answers to life's deepest questions, a spiritual family to belong to, or simply a place where the Bible is taught without compromise — you have found your home.
            </p>
            <p>
              We invite you to come as you are and let the word of God transform your life. Together, let us walk in the truth that has set millions free.
            </p>
          </div>

          <div class="mt-6 border-t border-gray-100 pt-4">
            <p class="font-serif italic text-[#1E3A5F] font-semibold">Bro. Emmanuel Okon</p>
            <p class="text-xs text-gray-400">Evangelist, Church of Christ — Ekot Ekpene</p>
          </div>
        </div>

        <!-- Service schedule -->
        <div class="flex flex-col justify-center bg-[#1E3A5F] p-8 text-white lg:p-12">
          <p class="mb-2 text-xs font-bold uppercase tracking-widest text-white/60">Join Us for Worship</p>
          <h3 class="font-serif text-2xl font-bold mb-8">Service Schedule</h3>

          <div class="space-y-5">
            <div class="flex items-center gap-4">
              <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10">
                <Icon icon="heroicons:sun" class="h-6 w-6 text-white" />
              </div>
              <div>
                <p class="font-semibold">Sunday Worship</p>
                <p class="text-sm text-white/60">Every Sunday · 9:00 AM</p>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10">
                <Icon icon="heroicons:academic-cap" class="h-6 w-6 text-white" />
              </div>
              <div>
                <p class="font-semibold">Bible Class</p>
                <p class="text-sm text-white/60">Every Sunday · 8:00 AM</p>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10">
                <Icon icon="heroicons:book-open" class="h-6 w-6 text-white" />
              </div>
              <div>
                <p class="font-semibold">Midweek Bible Study</p>
                <p class="text-sm text-white/60">Every Wednesday · 6:00 PM</p>
              </div>
            </div>
          </div>

          <a
            href="#contact"
            class="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white hover:bg-blue-600 transition-colors"
            aria-label="Join us for worship"
          >
            <Icon icon="heroicons:map-pin" class="h-4 w-4" />
            Join Us in Person
          </a>
        </div>
      </div>

      <!-- Stats row -->
      <div class="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div v-for="stat in stats" :key="stat.label" class="rounded-xl bg-white border border-gray-100 p-6 text-center shadow-sm">
          <p class="font-serif text-4xl font-bold text-[#1E3A5F]">{{ stat.value }}</p>
          <p class="mt-1 text-sm text-gray-500">{{ stat.label }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const stats = [
  { value: '750+', label: 'Active Members' },
  { value: '50+', label: 'Years of Service' },
  { value: '80+', label: 'Congregations' },
  { value: '5', label: 'Weekly Services' },
]
</script>
