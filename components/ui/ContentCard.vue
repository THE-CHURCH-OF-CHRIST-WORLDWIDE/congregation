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
  <article class="group flex h-full flex-col">
    <!-- Thumbnail -->
    <NuxtLink
      :to="linkPath"
      class="img-zoom relative block aspect-[4/3] bg-surface-sunken"
      tabindex="-1"
      aria-hidden="true"
    >
      <img
        v-if="props.thumbnail"
        :src="displayableImageUrl(props.thumbnail)"
        :alt="props.title"
        loading="lazy"
        decoding="async"
        class="h-full w-full object-cover"
      />
      <div
        v-else
        class="flex h-full w-full items-end bg-primary p-6 font-display text-3xl leading-tight text-on-night/40 italic"
      >
        {{ props.title }}
      </div>
    </NuxtLink>

    <!-- Body -->
    <div class="flex flex-1 flex-col pt-6">
      <NuxtLink :to="linkPath">
        <h3
          class="line-clamp-3 font-display text-[1.75rem] leading-[1.1] text-ink transition-colors duration-300 group-hover:text-primary-ink"
        >
          {{ props.title }}
        </h3>
      </NuxtLink>

      <div class="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-muted">
        <span>{{ props.author }}</span>
        <template v-if="props.date">
          <span aria-hidden="true" class="text-ink-subtle">/</span>
          <span class="num">{{ props.date }}</span>
        </template>
        <template v-if="props.tags.length">
          <span aria-hidden="true" class="text-ink-subtle">&middot;</span>
          <span class="text-ink-subtle">{{ props.tags.slice(0, 2).join(', ') }}</span>
        </template>
      </div>

      <NuxtLink :to="linkPath" class="link-line mt-5 self-start text-sm text-ink">
        <span class="link-text">Read more</span>
        <Icon icon="mdi:arrow-right" class="link-arrow h-4 w-4" />
      </NuxtLink>
    </div>
  </article>
</template>
