<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()
const store = usePublicTeachingsStore()

const sermon = computed(() => store.getSermonBySlug(route.params.slug as string))
const related = computed(() =>
  sermon.value
    ? sermon.value.relatedIds.map((id) => store.sermons.find((s) => s.id === id)).filter(Boolean)
    : []
)

watchEffect(() => {
  if (sermon.value) {
    useSeoMeta({
      title: `${sermon.value.title} — Sermons`,
      description: sermon.value.description,
      ogTitle: sermon.value.title,
      ogDescription: sermon.value.description,
      ogImage: sermon.value.thumbnailSrc,
    })
    useHead({
      script: [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'VideoObject',
            name: sermon.value.title,
            description: sermon.value.description,
            thumbnailUrl: sermon.value.thumbnailSrc,
            uploadDate: sermon.value.date,
            author: { '@type': 'Person', name: sermon.value.preacher },
          }),
        },
      ],
    })
  }
})

const viewCount = ref(Math.floor(Math.random() * 3000) + 500)

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
    <div
      v-if="!sermon"
      class="flex flex-col items-center justify-center min-h-[60vh] text-center px-6"
    >
      <Icon icon="heroicons:exclamation-circle" class="h-16 w-16 text-gray-300 mb-4" />
      <h1 class="font-serif text-3xl font-bold text-[#1E3A5F] mb-3">Sermon Not Found</h1>
      <p class="text-gray-500 mb-6">
        The sermon you're looking for doesn't exist or has been removed.
      </p>
      <NuxtLink
        to="/teachings/sermons"
        class="rounded-full bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        aria-label="Back to sermons"
      >
        Back to Sermons
      </NuxtLink>
    </div>

    <template v-else>
      <!-- Breadcrumb -->
      <div class="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <nav class="flex items-center gap-2 text-xs text-gray-400" aria-label="Breadcrumb">
          <NuxtLink to="/" class="hover:text-[#2563EB] transition-colors">Home</NuxtLink>
          <Icon icon="heroicons:chevron-right" class="h-3 w-3" />
          <NuxtLink to="/teachings/sermons" class="hover:text-[#2563EB] transition-colors"
            >Sermons</NuxtLink
          >
          <Icon icon="heroicons:chevron-right" class="h-3 w-3" />
          <span class="text-gray-600 line-clamp-1">{{ sermon.title }}</span>
        </nav>
      </div>

      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="grid gap-10 lg:grid-cols-3">
          <!-- Main content (2/3) -->
          <div class="lg:col-span-2">
            <!-- Video player -->
            <VideoPlayer
              :src="sermon.videoSrc"
              :thumbnail="sermon.thumbnailSrc"
              :title="sermon.title"
            />

            <!-- Tags -->
            <div class="mt-5 flex flex-wrap gap-2">
              <CategoryBadge v-for="tag in sermon.tags" :key="tag" :label="tag" />
              <CategoryBadge label="Faith" />
              <CategoryBadge label="Growth" />
              <CategoryBadge label="Discipline" />
            </div>

            <!-- Title + meta -->
            <h1 class="font-serif text-3xl font-bold text-[#1E3A5F] mt-5 leading-tight md:text-4xl">
              {{ sermon.title }}
            </h1>

            <div class="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
              <span class="flex items-center gap-1.5">
                <Icon icon="heroicons:user-circle" class="h-4 w-4" />
                {{ sermon.preacher }}
              </span>
              <span class="flex items-center gap-1.5">
                <Icon icon="heroicons:calendar" class="h-4 w-4" />
                {{ sermon.date }}
              </span>
              <span class="flex items-center gap-1.5">
                <Icon icon="heroicons:eye" class="h-4 w-4" />
                {{ viewCount.toLocaleString() }} views
              </span>
            </div>

            <!-- Lesson Content -->
            <div class="mt-10 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
              <div class="flex items-center justify-between mb-6">
                <h2 class="font-serif text-xl font-bold text-[#1E3A5F]">Lesson Content</h2>
                <button
                  class="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                  aria-label="Download PDF"
                >
                  <Icon icon="heroicons:arrow-down-tray" class="h-4 w-4" />
                  Download PDF
                </button>
              </div>

              <p class="text-sm text-gray-600 leading-relaxed mb-6">{{ sermon.description }}</p>

              <!-- Why this lesson -->
              <div class="mb-8">
                <h3 class="font-semibold text-[#1E3A5F] mb-4 flex items-center gap-2">
                  <Icon icon="heroicons:bookmark" class="h-5 w-5 text-[#2563EB]" />
                  Key Lesson Points
                </h3>
                <ul class="space-y-3">
                  <li
                    v-for="(point, i) in sermon.lessonPoints"
                    :key="i"
                    class="flex items-start gap-3 text-sm text-gray-600"
                  >
                    <Icon
                      icon="heroicons:check-circle"
                      class="mt-0.5 h-5 w-5 shrink-0 text-[#2563EB]"
                    />
                    {{ point }}
                  </li>
                </ul>
              </div>

              <!-- Divider + scripture -->
              <div class="border-t border-gray-100 pt-8">
                <h3 class="font-semibold text-[#1E3A5F] mb-4 flex items-center gap-2">
                  <Icon icon="heroicons:users" class="h-5 w-5 text-[#2563EB]" />
                  Why Be a Soul Winner?
                </h3>
                <ul class="space-y-3">
                  <li
                    v-for="(point, i) in sermon.soulWinnerPoints"
                    :key="i"
                    class="flex items-start gap-3 text-sm text-gray-600"
                  >
                    <Icon
                      icon="heroicons:check-circle"
                      class="mt-0.5 h-5 w-5 shrink-0 text-green-500"
                    />
                    {{ point }}
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
                aria-label="Share sermon link"
                @click="share"
              >
                <Icon :icon="copied ? 'heroicons:check' : 'heroicons:share'" class="h-4 w-4" />
                {{ copied ? 'Link Copied!' : 'Share Sermon' }}
              </button>
              <div class="mt-3 flex gap-3">
                <a
                  href="#"
                  aria-label="Share on Facebook"
                  class="flex-1 flex items-center justify-center gap-1 rounded-lg bg-[#1877F2]/10 py-2.5 text-xs font-medium text-[#1877F2] hover:bg-[#1877F2]/20 transition-colors"
                >
                  <Icon icon="mdi:facebook" class="h-4 w-4" /> Facebook
                </a>
                <a
                  href="#"
                  aria-label="Share on WhatsApp"
                  class="flex-1 flex items-center justify-center gap-1 rounded-lg bg-[#25D366]/10 py-2.5 text-xs font-medium text-[#25D366] hover:bg-[#25D366]/20 transition-colors"
                >
                  <Icon icon="mdi:whatsapp" class="h-4 w-4" /> WhatsApp
                </a>
              </div>
            </div>

            <!-- Related messages -->
            <div class="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 class="font-serif font-bold text-[#1E3A5F] mb-5">Related Messages</h3>
              <div class="flex flex-col gap-4">
                <div v-for="rel in related.slice(0, 3)" :key="rel!.id" class="group">
                  <NuxtLink :to="`/teachings/sermons/${rel!.slug}`" class="flex gap-3">
                    <img
                      :src="rel!.thumbnailSrc"
                      :alt="rel!.title"
                      loading="lazy"
                      class="h-16 w-24 shrink-0 rounded-lg object-cover"
                    />
                    <div class="flex-1 min-w-0">
                      <div class="flex flex-wrap gap-1 mb-1">
                        <CategoryBadge
                          v-for="tag in rel!.tags.slice(0, 1)"
                          :key="tag"
                          :label="tag"
                        />
                      </div>
                      <p
                        class="text-sm font-semibold text-[#1E3A5F] line-clamp-2 group-hover:text-[#2563EB] transition-colors"
                      >
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
