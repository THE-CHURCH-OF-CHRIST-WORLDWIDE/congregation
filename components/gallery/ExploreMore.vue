<script setup lang="ts">
const categories = [
  { label: 'Gospel Meeting', slug: 'gospel-meeting', src: 'https://picsum.photos/seed/gm1/600/300' },
  { label: 'Bible Class',    slug: 'bible-class',    src: 'https://picsum.photos/seed/bc1/600/300' },
  { label: 'Evangelism',     slug: 'evangelism',     src: 'https://picsum.photos/seed/ev1/600/300' },
]
</script>

<template>
  <div class="px-8 pb-14">
    <h2 class="mb-5 text-[22px] font-bold text-gray-900">Explore More Images</h2>

    <div class="grid grid-cols-3 gap-4 sm:grid-cols-3">
      <NuxtLink
        v-for="cat in categories"
        :key="cat.slug"
        :to="`/gallery/${cat.slug}`"
        class="explore-card group"
        :aria-label="`${cat.label} gallery`"
      >
        <img :src="cat.src" :alt="cat.label" class="absolute inset-0 h-full w-full object-cover" loading="lazy" />
        <div class="explore-overlay group-hover:bg-black/60"></div>
        <span class="explore-label">{{ cat.label }}</span>
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.explore-card {
  position: relative;
  height: 100px;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  display: block;
  text-decoration: none;
}

.explore-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 1;
  transition: background 0.2s ease;
}

.explore-label {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 15px;
  font-weight: 700;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
}

@media (max-width: 480px) {
  .explore-card { height: 80px; }
}
</style>
