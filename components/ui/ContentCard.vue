<script setup lang="ts">
const props = defineProps<{
  thumbnail: string
  tags: string[]
  title: string
  author: string
  date?: string
  slug: string
  type: 'sermon' | 'sunday-school' | 'stream'
}>()

const linkPath = computed(() => {
  if (props.type === 'sermon') return `/teachings/sermons/${props.slug}`
  if (props.type === 'sunday-school') return `/teachings/sunday-school/${props.slug}`
  return `/live-streams`
})
</script>

<template>
  <article class="group flex flex-col rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow">
    <!-- Thumbnail -->
    <NuxtLink :to="linkPath" class="block relative overflow-hidden" style="aspect-ratio:16/9">
      <img
        :src="props.thumbnail"
        :alt="props.title"
        loading="lazy"
        class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div class="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" ></div>
      <div class="absolute top-3 left-3 flex flex-wrap gap-1">
        <CategoryBadge v-for="tag in props.tags.slice(0, 2)" :key="tag" :label="tag" />
      </div>
    </NuxtLink>

    <!-- Body -->
    <div class="flex flex-1 flex-col p-4">
      <NuxtLink :to="linkPath">
        <h3 class="font-serif font-bold text-[#1E3A5F] leading-snug line-clamp-2 hover:text-[#2563EB] transition-colors">
          {{ props.title }}
        </h3>
      </NuxtLink>

      <div class="mt-2 flex items-center gap-2 text-xs text-gray-500">
        <Icon icon="heroicons:user-circle" class="h-4 w-4 shrink-0" />
        <span>{{ props.author }}</span>
        <template v-if="props.date">
          <span>·</span>
          <span>{{ props.date }}</span>
        </template>
      </div>

      <NuxtLink
        :to="linkPath"
        class="mt-4 mt-auto inline-flex items-center gap-1 text-sm font-medium text-[#2563EB] hover:underline"
      >
        Read more
        <Icon icon="heroicons:arrow-right" class="h-4 w-4" />
      </NuxtLink>
    </div>
  </article>
</template>
