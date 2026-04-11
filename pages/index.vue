<script setup lang="ts">
import { useChurchSettingsStore } from '../stores/useChurchSettingsStore'

definePageMeta({
  layout: 'default',
})

const store = useChurchSettingsStore()
store.load()
</script>

<template>
<div>
    <HeroSection
    :name="store.settings.name"
    :address="store.settings.address"
    :image-url="store.settings.heroImageUrl"
  />
</div>
</template>