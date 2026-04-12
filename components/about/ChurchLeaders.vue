<script setup lang="ts">
interface Leader {
  id: string
  name: string
  role: string
  avatar: string
}

const leaders: Leader[] = [
  { id: 'l1', name: 'Akpan Lincoln',      role: 'Elder',    avatar: 'https://picsum.photos/seed/ldr-al1/300/300' },
  { id: 'l2', name: 'Chidi Okafor',       role: 'Elder',    avatar: 'https://picsum.photos/seed/ldr-co/300/300' },
  { id: 'l3', name: 'Obinna Nwosu',       role: 'Elder',    avatar: 'https://picsum.photos/seed/ldr-on/300/300' },
  { id: 'l4', name: 'Tunde Adebayo',      role: 'Elder',    avatar: 'https://picsum.photos/seed/ldr-ta/300/300' },
  { id: 'l5', name: 'Akpan Lincoln',      role: 'Deacon',   avatar: 'https://picsum.photos/seed/ldr-al2/300/300' },
  { id: 'l6', name: 'Bola Mikhail',       role: 'Deacon',   avatar: 'https://picsum.photos/seed/ldr-bm/300/300' },
  { id: 'l7', name: 'Chijioke Emmanuel',  role: 'Deacon',   avatar: 'https://picsum.photos/seed/ldr-ce/300/300' },
  { id: 'l8', name: 'Akpan Lincoln',      role: 'Minister', avatar: 'https://picsum.photos/seed/ldr-al3/300/300' },
]

function initials(name: string): string {
  return name.split(' ').map(n => n[0] ?? '').join('').toUpperCase().slice(0, 2)
}

function onImgError(e: Event) {
  const img = e.target as HTMLImageElement
  img.style.display = 'none'
  const fallback = img.nextElementSibling as HTMLElement | null
  if (fallback) fallback.classList.remove('hidden')
}
</script>

<template>
  <section class="bg-white py-16">
    <div class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">

      <!-- Header -->
      <div class="mb-12 text-center">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Leaders</p>
        <h2 class="mt-2 font-serif text-3xl font-bold text-gray-900">Our Church Leaders</h2>
      </div>

      <!-- Grid: 2 cols on mobile → 3 on sm → 4 on lg -->
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <div
          v-for="leader in leaders"
          :key="leader.id"
          class="flex flex-col items-center rounded-2xl border border-gray-200 bg-gray-50/60 px-4 py-7"
        >
          <!-- Avatar -->
          <div class="relative h-[110px] w-[110px] shrink-0">
            <img
              :src="leader.avatar"
              :alt="leader.name"
              class="h-[110px] w-[110px] rounded-full object-cover"
              @error="onImgError"
            />
            <!-- Initials fallback -->
            <div
              class="absolute inset-0 hidden h-[110px] w-[110px] items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-800"
            >
              {{ initials(leader.name) }}
            </div>
          </div>

          <!-- Name -->
          <p class="mt-4 text-center text-[15px] font-semibold leading-snug text-gray-900">
            {{ leader.name }}
          </p>

          <!-- Role -->
          <p class="mt-1 text-center text-[13px] text-gray-500">
            {{ leader.role }}
          </p>
        </div>
      </div>

    </div>
  </section>
</template>
