<script setup lang="ts">
definePageMeta({
  layout: 'default',
  // The page opens on a full-bleed night cover, so the navbar sits over it transparently.
  navOverlay: true,
})

useSeoMeta({
  title: 'About Us — Church of Christ',
  description:
    'Learn about the history, worship activities, church leaders, and meeting schedule of the Church of Christ at 7b Esa Atan Extension, Ikot Ekpene.',
  ogTitle: 'About Us — Church of Christ, 7b Esa Atan Extension',
  ogDescription:
    'A New Testament congregation established on the authority of the Scriptures. Visit us every Sunday for worship.',
  ogImage: 'https://picsum.photos/seed/church-building/1200/630',
})
</script>

<template>
  <div class="bg-surface">
    <AboutHero />
    <ChurchHistoryCard />
    <WorshipActivities />
    <ChurchLeaders />
    <ActivityCalendar />
    <WorshipThisSunday />
  </div>
</template>
