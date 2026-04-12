<script setup lang="ts">
definePageMeta({
  layout: 'default',
  pageTransition: { name: 'fade', mode: 'out-in' },
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
  <div>
    <AboutHero />
    <ChurchHistoryCard />
    <WorshipActivities />
    <ChurchLeaders />
    <ActivityCalendar />
    <WorshipThisSunday />
  </div>
</template>
