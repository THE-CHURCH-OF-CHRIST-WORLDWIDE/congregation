<script setup lang="ts">
interface Activity {
  name: string
  icon: string
  description: string
}

const activities: Activity[] = [
  {
    name: 'Prayer',
    icon: 'mdi:hands-pray',
    description: '1 Thessalonians 5:17',
  },
  {
    name: 'Singing',
    icon: 'mdi:music',
    description: 'Ephesians 5:19',
  },
  {
    name: 'Teaching',
    icon: 'mdi:book-open-variant',
    description: 'Acts 2:42',
  },
  {
    name: 'Giving',
    icon: 'mdi:hand-heart',
    description: '1 Corinthians 16:2',
  },
  {
    name: 'Communion',
    icon: 'mdi:cup-outline',
    description: 'Acts 20:7',
  },
]
</script>

<template>
  <section class="bg-navy py-16">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-12 text-center">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
          Form of Worship
        </p>
        <h2 class="mt-2 font-serif text-3xl font-bold text-white">
          Our Worship Activities
        </h2>
        <p class="mx-auto mt-3 max-w-xl text-sm text-white/60">
          Our worship follows the New Testament pattern — simple, scriptural, and sincere.
        </p>
      </div>

      <!-- Cards row -->
      <div class="flex flex-wrap justify-center gap-4">
        <div
          v-for="activity in activities"
          :key="activity.name"
          class="flex min-w-[130px] flex-1 basis-[130px] flex-col items-center rounded-xl bg-white px-5 py-7 shadow-sm transition-shadow hover:shadow-md sm:basis-[150px]"
        >
          <!-- Icon -->
          <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
            <Icon :icon="activity.icon" class="h-7 w-7 text-blue-600" />
          </div>

          <!-- Name -->
          <span class="text-[14px] font-semibold text-gray-900">{{ activity.name }}</span>

          <!-- Scripture ref -->
          <span class="mt-1 text-[11px] text-gray-400">{{ activity.description }}</span>
        </div>
      </div>
    </div>
  </section>
</template>
