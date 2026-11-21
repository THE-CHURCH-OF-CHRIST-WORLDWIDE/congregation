import { defineNuxtPlugin } from '#app'
import type { Directive } from 'vue'

/**
 * Presentation-only motion for the public site.
 *
 * `v-reveal`            → rise (default)
 * `v-reveal="'unveil'"` → image frame opens from the bottom while the photo settles
 * `v-reveal:fade`       → arg form; `v-reveal:rise.200` adds a 200ms delay
 * `v-reveal="{ type: 'rule', delay: 120 }"`
 *
 * `v-parallax="0.12"` drifts an element against the scroll by that fraction.
 *
 * Both respect `prefers-reduced-motion`: elements are shown in place and nothing moves.
 * Content that is already on screen at mount is revealed on the next frame, so a missed
 * observer can never leave a section blank.
 */

type RevealType = 'rise' | 'fade' | 'unveil' | 'rule'
type RevealValue = RevealType | { type?: RevealType; delay?: number } | undefined

const reduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

let observer: IntersectionObserver | null = null
function getObserver() {
  if (observer) return observer
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in')
          observer?.unobserve(entry.target)
        }
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
  )
  return observer
}

function resolve(binding: {
  value: RevealValue
  arg?: string
  modifiers: Partial<Record<string, boolean>>
}) {
  const v = binding.value
  let type: RevealType = (binding.arg as RevealType) || 'rise'
  let delay = 0
  if (typeof v === 'string') type = v
  else if (v && typeof v === 'object') {
    if (v.type) type = v.type
    if (v.delay) delay = v.delay
  }
  const mod = Object.keys(binding.modifiers).find((m) => /^\d+$/.test(m))
  if (mod) delay = Number(mod)
  return { type, delay }
}

const reveal: Directive<HTMLElement, RevealValue> = {
  mounted(el, binding) {
    const { type, delay } = resolve(binding)
    el.dataset.reveal = type
    if (delay) el.style.setProperty('--rv-delay', `${delay}ms`)
    if (reduced()) {
      el.classList.add('is-in')
      return
    }
    getObserver().observe(el)
  },
  unmounted(el) {
    observer?.unobserve(el)
  },
}

// ── Parallax: one shared rAF loop for every element ──
const parallaxEls = new Map<HTMLElement, number>()
let ticking = false
function updateParallax() {
  ticking = false
  const vh = window.innerHeight
  parallaxEls.forEach((speed, el) => {
    const rect = el.parentElement?.getBoundingClientRect() ?? el.getBoundingClientRect()
    if (rect.bottom < -200 || rect.top > vh + 200) return
    const offset = (rect.top + rect.height / 2 - vh / 2) * -speed
    el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`
  })
}
function onScroll() {
  if (!ticking) {
    ticking = true
    requestAnimationFrame(updateParallax)
  }
}

const parallax: Directive<HTMLElement, number | undefined> = {
  mounted(el, binding) {
    if (reduced()) return
    if (parallaxEls.size === 0) {
      window.addEventListener('scroll', onScroll, { passive: true })
      window.addEventListener('resize', onScroll, { passive: true })
    }
    parallaxEls.set(el, binding.value ?? 0.1)
    el.style.willChange = 'transform'
    onScroll()
  },
  unmounted(el) {
    parallaxEls.delete(el)
    if (parallaxEls.size === 0) {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  },
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('reveal', reveal)
  nuxtApp.vueApp.directive('parallax', parallax)
})
