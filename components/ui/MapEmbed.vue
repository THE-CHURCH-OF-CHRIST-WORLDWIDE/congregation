<script setup lang="ts">
const props = defineProps<{
  address?: string
  height?: string
}>()

// With no explicit address, fall back to the congregation's address from
// Settings → General rather than to a literal, so editing it there follows through
// to every map on the site.
const settingsStore = useChurchSettingsStore()

onMounted(() => settingsStore.load())

const query = computed(() => props.address?.trim() || settingsStore.settings.address)
</script>

<template>
  <div :style="{ height: height ?? '320px' }" class="w-full overflow-hidden rounded-xl bg-gray-100">
    <iframe
      :src="`https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed`"
      width="100%"
      height="100%"
      style="border: 0"
      allowfullscreen
      loading="lazy"
      referrerpolicy="no-referrer-when-downgrade"
      title="Church location map"
    ></iframe>
  </div>
</template>
