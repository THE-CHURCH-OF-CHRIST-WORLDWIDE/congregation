<script setup lang="ts">
definePageMeta({ layout: 'default' })

useSeoMeta({
  title: 'Privacy Policy — Church of Christ',
  description: 'How this website collects, uses and protects your personal information.',
  ogTitle: 'Privacy Policy',
})
</script>

<template>
  <LegalDocument page="privacyPolicy" :title="['Privacy', 'Policy']" />
</template>
