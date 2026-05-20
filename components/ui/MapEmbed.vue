<script setup lang="ts">
defineProps<{
  address?: string
  height?: string
}>()
</script>

<template>
  <div :style="{ height: height ?? '320px' }" class="w-full overflow-hidden rounded-xl bg-gray-100">
    <iframe
      :src="`https://maps.google.com/maps?q=${encodeURIComponent(address ?? '7b Esa Atan, Ekot Ekpene, Akwa Ibom, Nigeria')}&output=embed`"
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
