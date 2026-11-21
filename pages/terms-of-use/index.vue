<script setup lang="ts">
definePageMeta({ layout: 'default' })

useSeoMeta({
  title: 'Terms of Use — Church of Christ',
  description: 'The terms that apply to your use of this website.',
  ogTitle: 'Terms of Use',
})
</script>

<template>
  <LegalDocument page="termsOfUse" :title="['Terms of', 'Use']" />
</template>
