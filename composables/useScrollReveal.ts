import { ref, onMounted, onUnmounted } from 'vue'

interface ScrollRevealOptions {
  threshold?: number
  rootMargin?: string
}

/**
 * Observes an element with IntersectionObserver and sets `isVisible` to true
 * the first time it enters the viewport. Disconnects after first trigger for
 * a one-shot entrance animation. Bind the returned `el` ref to the target
 * element via `ref="el"` in the template.
 */
export function useScrollReveal(options?: ScrollRevealOptions) {
  const el = ref<HTMLElement | null>(null)
  const isVisible = ref(false)

  let observer: IntersectionObserver | null = null

  onMounted(() => {
    if (!el.value) return

    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          isVisible.value = true
          observer?.disconnect()
        }
      },
      {
        threshold: options?.threshold ?? 0.08,
        rootMargin: options?.rootMargin ?? '0px 0px -48px 0px',
      }
    )

    observer.observe(el.value)
  })

  onUnmounted(() => {
    observer?.disconnect()
  })

  return { el, isVisible }
}
