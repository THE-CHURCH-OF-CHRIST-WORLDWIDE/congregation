import type { Directive } from 'vue'

declare module 'vue' {
  export interface ComponentCustomProperties {
    vReveal: Directive<HTMLElement, string | { type?: string; delay?: number } | undefined>
    vParallax: Directive<HTMLElement, number | undefined>
  }
}

export {}
