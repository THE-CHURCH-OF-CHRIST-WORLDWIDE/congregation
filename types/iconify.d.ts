import type { DefineComponent } from 'vue'

declare module 'vue' {
  export interface GlobalComponents {
    Icon: DefineComponent
  }
}
