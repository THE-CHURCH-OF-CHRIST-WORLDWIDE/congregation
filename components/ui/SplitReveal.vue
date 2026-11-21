<script setup lang="ts">
/**
 * Masked word-by-word headline reveal. Each word rises from behind its own mask
 * when the heading enters the viewport (or immediately, with `immediate`).
 *
 * Purely presentational: the full text stays in the DOM as real text, so screen
 * readers, search and copy/paste read it normally.
 */
const props = withDefaults(
  defineProps<{
    text?: string | null
    tag?: string
    /** ms before the first word starts */
    delay?: number
    /** ms between words */
    stagger?: number
    /** reveal on mount rather than on scroll (for the first viewport) */
    immediate?: boolean
  }>(),
  { text: '', tag: 'span', delay: 0, stagger: 55, immediate: false }
)

const words = computed(() => (props.text ?? '').split(/\s+/).filter(Boolean))
const root = ref<HTMLElement | null>(null)
const shown = ref(false)

let io: IntersectionObserver | null = null
onMounted(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced || props.immediate) {
    requestAnimationFrame(() => (shown.value = true))
    return
  }
  io = new IntersectionObserver(
    ([entry]) => {
      if (entry?.isIntersecting) {
        shown.value = true
        io?.disconnect()
      }
    },
    { threshold: 0.2 }
  )
  if (root.value) io.observe(root.value)
})
onBeforeUnmount(() => io?.disconnect())
</script>

<template>
  <component :is="tag" ref="root" :class="{ 'is-in': shown }">
    <template v-for="(w, i) in words" :key="i">
      <span class="split-line"
        ><span class="split-word" :style="{ '--sw-delay': `${delay + i * stagger}ms` }">{{
          w
        }}</span></span
      >{{ i < words.length - 1 ? ' ' : '' }}
    </template>
    <slot></slot>
  </component>
</template>
