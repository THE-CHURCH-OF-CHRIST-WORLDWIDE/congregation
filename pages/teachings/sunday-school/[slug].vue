<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()
const store = usePublicTeachingsStore()

const lesson = computed(() => store.getLessonBySlug(route.params.slug as string))
const related = computed(() =>
  lesson.value
    ? lesson.value.relatedIds
        .map(id => store.sundaySchool.find(l => l.id === id))
        .filter(Boolean)
    : [],
)

watchEffect(() => {
  if (lesson.value) {
    useSeoMeta({
      title: `${lesson.value.title} — Sunday School`,
      description: lesson.value.overviewGoals[0] ?? '',
      ogTitle: lesson.value.title,
      ogDescription: lesson.value.overviewGoals[0] ?? '',
      ogImage: lesson.value.thumbnailSrc,
    })
    useHead({
      script: [{
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'VideoObject',
          name: lesson.value.title,
          description: lesson.value.overviewGoals[0] ?? '',
          thumbnailUrl: lesson.value.thumbnailSrc,
          uploadDate: lesson.value.date,
          author: { '@type': 'Person', name: lesson.value.preacher },
        }),
      }],
    })
  }
})

const copied = ref(false)
function share() {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(window.location.href)
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  }
}
</script>

<template>
  <div class="pt-16 pb-20">
    <!-- Not found -->
    <div v-if="!lesson" class="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <Icon icon="heroicons:exclamation-circle" class="h-16 w-16 text-gray-300 mb-4" />
      <h1 class="font-serif text-3xl font-bold text-[#1E3A5F] mb-3">Lesson Not Found</h1>
      <p class="text-gray-500 mb-6">The lesson you're looking for doesn't exist or has been removed.</p>
      <NuxtLink
        to="/teachings/sunday-school"
        class="rounded-full bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        aria-label="Back to Sunday School"
      >
        Back to Sunday School
      </NuxtLink>
    </div>

    <template v-else>
      <!-- Breadcrumb -->
      <div class="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <nav class="flex items-center gap-2 text-xs text-gray-400" aria-label="Breadcrumb">
          <NuxtLink to="/" class="hover:text-[#2563EB] transition-colors">Home</NuxtLink>
          <Icon icon="heroicons:chevron-right" class="h-3 w-3" />
          <NuxtLink to="/teachings/sunday-school" class="hover:text-[#2563EB] transition-colors">Sunday School</NuxtLink>
          <Icon icon="heroicons:chevron-right" class="h-3 w-3" />
          <span class="text-gray-600 line-clamp-1">{{ lesson.title }}</span>
        </nav>
      </div>

      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="grid gap-10 lg:grid-cols-3">

          <!-- Main content (2/3) -->
          <div class="lg:col-span-2">
            <!-- Lesson thumbnail -->
            <div class="relative overflow-hidden rounded-2xl" style="aspect-ratio:16/9">
              <img
                :src="lesson.thumbnailSrc"
                :alt="lesson.title"
                loading="lazy"
                class="h-full w-full object-cover"
              />
              <div class="absolute inset-0 bg-[#1E3A5F]/40 flex items-center justify-center">
                <span class="rounded-full bg-white/90 px-4 py-1.5 text-xs font-bold text-[#1E3A5F] uppercase tracking-wider">
                  Sunday School
                </span>
              </div>
            </div>

            <!-- Tags -->
            <div class="mt-5 flex flex-wrap gap-2">
              <CategoryBadge v-for="tag in lesson.tags" :key="tag" :label="tag" />
            </div>

            <!-- Title + meta -->
            <h1 class="font-serif text-3xl font-bold text-[#1E3A5F] mt-5 leading-tight md:text-4xl">
              {{ lesson.title }}
            </h1>

            <div class="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
              <span class="flex items-center gap-1.5">
                <Icon icon="heroicons:user-circle" class="h-4 w-4" />
                {{ lesson.preacher }}
              </span>
              <span class="flex items-center gap-1.5">
                <Icon icon="heroicons:calendar" class="h-4 w-4" />
                {{ lesson.date }}
              </span>
            </div>

            <!-- Lesson Overview -->
            <div class="mt-10 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
              <h2 class="font-serif text-xl font-bold text-[#1E3A5F] mb-6">Lesson Overview</h2>

              <!-- Overview Goals -->
              <div class="mb-8">
                <h3 class="font-semibold text-[#1E3A5F] mb-4 flex items-center gap-2">
                  <Icon icon="heroicons:bookmark" class="h-5 w-5 text-[#2563EB]" />
                  Why This Lesson?
                </h3>
                <ul class="space-y-3">
                  <li
                    v-for="(goal, i) in lesson.overviewGoals"
                    :key="i"
                    class="flex items-start gap-3 text-sm text-gray-600"
                  >
                    <Icon icon="heroicons:check-circle" class="mt-0.5 h-5 w-5 shrink-0 text-[#2563EB]" />
                    {{ goal }}
                  </li>
                </ul>
              </div>

              <!-- Scripture pull-quote -->
              <blockquote class="border-l-4 border-[#2563EB] pl-6 my-8 italic text-[#1E3A5F] text-base leading-relaxed font-serif">
                {{ lesson.scripture }}
              </blockquote>

              <!-- Church Duties section -->
              <div class="border-t border-gray-100 pt-8">
                <h3 class="font-semibold text-[#1E3A5F] mb-4 flex items-center gap-2">
                  <Icon icon="heroicons:building-library" class="h-5 w-5 text-[#2563EB]" />
                  Duty of the Church
                </h3>
                <ul class="space-y-3">
                  <li
                    v-for="(duty, i) in lesson.churchDuties"
                    :key="i"
                    class="flex items-start gap-3 text-sm text-gray-600"
                  >
                    <Icon icon="heroicons:check-circle" class="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                    {{ duty }}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Sidebar (1/3) -->
          <div class="flex flex-col gap-6">
            <!-- Share -->
            <div class="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 class="font-serif font-bold text-[#1E3A5F] mb-4">Share This Message</h3>
              <button
                class="w-full flex items-center justify-center gap-2 rounded-lg bg-[#1E3A5F] py-3 text-sm font-semibold text-white hover:bg-[#2563EB] transition-colors"
                aria-label="Share lesson link"
                @click="share"
              >
                <Icon :icon="copied ? 'heroicons:check' : 'heroicons:share'" class="h-4 w-4" />
                {{ copied ? 'Link Copied!' : 'Share Lesson' }}
              </button>
              <div class="mt-3 flex gap-3">
                <a href="#" aria-label="Share on Facebook" class="flex-1 flex items-center justify-center gap-1 rounded-lg bg-[#1877F2]/10 py-2.5 text-xs font-medium text-[#1877F2] hover:bg-[#1877F2]/20 transition-colors">
                  <Icon icon="mdi:facebook" class="h-4 w-4" /> Facebook
                </a>
                <a href="#" aria-label="Share on WhatsApp" class="flex-1 flex items-center justify-center gap-1 rounded-lg bg-[#25D366]/10 py-2.5 text-xs font-medium text-[#25D366] hover:bg-[#25D366]/20 transition-colors">
                  <Icon icon="mdi:whatsapp" class="h-4 w-4" /> WhatsApp
                </a>
              </div>
            </div>

            <!-- Related lessons -->
            <div class="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 class="font-serif font-bold text-[#1E3A5F] mb-5">Related Lessons</h3>
              <div class="flex flex-col gap-4">
                <div
                  v-for="rel in related.slice(0, 3)"
                  :key="rel!.id"
                  class="group"
                >
                  <NuxtLink :to="`/teachings/sunday-school/${rel!.slug}`" class="flex gap-3">
                    <img
                      :src="rel!.thumbnailSrc"
                      :alt="rel!.title"
                      loading="lazy"
                      class="h-16 w-24 shrink-0 rounded-lg object-cover"
                    />
                    <div class="flex-1 min-w-0">
                      <div class="flex flex-wrap gap-1 mb-1">
                        <CategoryBadge v-for="tag in rel!.tags.slice(0, 1)" :key="tag" :label="tag" />
                      </div>
                      <p class="text-sm font-semibold text-[#1E3A5F] line-clamp-2 group-hover:text-[#2563EB] transition-colors">
                        {{ rel!.title }}
                      </p>
                      <p class="mt-1 text-xs text-[#2563EB] flex items-center gap-1">
                        Read more <Icon icon="heroicons:arrow-right" class="h-3 w-3" />
                      </p>
                    </div>
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
