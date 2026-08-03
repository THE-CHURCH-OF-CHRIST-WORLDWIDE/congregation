<script setup lang="ts">
// Staging and production are separate Firebase projects with identical UIs, so the
// only way to tell them apart at a glance is this bar. Production renders nothing —
// a banner that is always present is a banner nobody reads.
const config = useRuntimeConfig()

const env = String(config.public.appEnv || 'development')
const projectId = String(config.public.firebaseProjectId || 'unknown project')

const isProduction = env === 'production'
const barClass =
  env === 'development' ? 'bg-slate-700 text-slate-100' : 'bg-amber-500 text-amber-950'
</script>

<template>
  <div
    v-if="!isProduction"
    :class="[
      'flex items-center justify-center gap-2 px-4 py-1 text-[11px] font-medium tracking-wide',
      barClass,
    ]"
  >
    <Icon icon="mdi:flask-outline" class="text-sm shrink-0" />
    <span class="uppercase">{{ env }}</span>
    <span class="opacity-70">·</span>
    <span class="truncate opacity-90">{{ projectId }}</span>
  </div>
</template>
