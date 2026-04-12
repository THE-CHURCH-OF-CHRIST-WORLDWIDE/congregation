<script setup lang="ts">
definePageMeta({ layout: 'default' })

useSeoMeta({
  title: 'The Church of Christ — Ekot Ekpene',
  description: 'Welcome to the Church of Christ, Ekot Ekpene. Join us for Sunday Worship, Bible Classes, and live streamed services. A New Testament church built on the word of God.',
  ogTitle: 'The Church of Christ — Ekot Ekpene',
  ogDescription: 'A New Testament church built solely on the word of God. Find worship times, live streams, sermons, and Sunday School lessons.',
  ogImage: '/images/heroImg.png',
})

useHead({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Church of Christ, Worldwide',
      url: 'https://churchofchrist.org',
      description: 'Open-source Church of Christ management and public website.',
    }),
  }],
})
</script>

<template>
  <div>
    <HeroBanner />
    <MinisterWelcome />
    <LiveStreamTeaser />
    <CongregationSearch />
    <SermonsTeaser />
    <EventsList />
    <ContactForm />
    <PhotoGallery />
  </div>
</template>
