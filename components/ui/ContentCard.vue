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
  <article
    class="group flex h-full flex-col overflow-hidden rounded-lg border border-rule bg-surface shadow-xs transition-[box-shadow,border-color] duration-200 hover:border-rule-strong hover:shadow-md"
  >
    <!-- Thumbnail -->
    <NuxtLink
      :to="linkPath"
      class="relative block overflow-hidden rounded-none bg-surface-sunken"
      style="aspect-ratio: 16/9"
    >
      <img
        :src="displayableImageUrl(props.thumbnail)"
        :alt="props.title"
        loading="lazy"
        decoding="async"
        class="h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
      />
      <div
        class="absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/10"
      ></div>
      <div class="absolute top-3 left-3 flex flex-wrap gap-1.5">
        <CategoryBadge v-for="tag in props.tags.slice(0, 2)" :key="tag" :label="tag" />
      </div>
    </NuxtLink>

    <!-- Body -->
    <div class="flex flex-1 flex-col p-5">
      <NuxtLink :to="linkPath">
        <h3
          class="line-clamp-2 font-display text-lg leading-snug font-semibold text-ink transition-colors duration-150 hover:text-primary-ink"
        >
          {{ props.title }}
        </h3>
      </NuxtLink>

      <div class="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-muted">
        <Icon icon="mdi:account-outline" class="h-4 w-4 shrink-0 text-ink-subtle" />
        <span>{{ props.author }}</span>
        <template v-if="props.date">
          <span aria-hidden="true" class="text-ink-subtle">·</span>
          <span class="num">{{ props.date }}</span>
        </template>
      </div>

      <NuxtLink
        :to="linkPath"
        class="mt-auto inline-flex min-h-11 items-center gap-1.5 self-start pt-4 text-base font-semibold text-primary-ink underline-offset-3 hover:text-primary-hover hover:underline"
      >
        Read more
        <Icon icon="mdi:arrow-right" class="h-5 w-5" />
      </NuxtLink>
    </div>
  </article>
</template>
