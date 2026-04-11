<script lang="ts" setup>
import { ref } from "vue";

const isMenuOpen = ref(false);
const isTeachingsOpen = ref(false);
const teachingsTimeout = ref<ReturnType<typeof setTimeout> | null>(null);

function openTeachings() {
  if (teachingsTimeout.value) clearTimeout(teachingsTimeout.value);
  isTeachingsOpen.value = true;
}

function closeTeachings() {
  teachingsTimeout.value = setTimeout(() => {
    isTeachingsOpen.value = false;
  }, 150);
}

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value;
}

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Live Streams", href: "/live" },
  { label: "Events", href: "/events" },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
];

const teachingCategories = [
  {
    icon: "mdi:microphone",
    label: "Sermons",
    description: "A well curated library of sermons",
    href: "/teachings/sermons",
  },
  {
    icon: "mdi:account-group",
    label: "Sunday School",
    description: "In-depth exploration and studying of the bible",
    href: "/teachings/sunday-school",
  },
  {
    icon: "mdi:video",
    label: "Watch Live recordings",
    description: "Catch up on services you missed",
    href: "/teachings/recordings",
  },
];
</script>

<template>
  <header
    class="sticky top-0 z-50 w-full border-b border-gray-100 bg-white shadow-sm"
  >
    <nav
      class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8"
    >
      <!-- Logo -->
      <a href="/" class="flex shrink-0 items-center gap-2">
        <div
          class="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 border-gray-800"
        >
          <Icon icon="mdi:church" class="text-2xl text-gray-800" />
        </div>
      </a>

      <!-- Desktop Nav -->
      <ul class="hidden items-center gap-6 lg:flex">
        <li v-for="link in navLinks" :key="link.label">
          <a
            :href="link.href"
            class="text-sm font-medium text-gray-700 transition-colors hover:text-gray-900"
          >
            {{ link.label }}
          </a>
        </li>

        <!-- Teachings with mega dropdown -->
        <li
          class="relative"
          @mouseenter="openTeachings"
          @mouseleave="closeTeachings"
        >
          <button
            class="flex items-center gap-1 text-sm font-medium text-gray-700 transition-colors hover:text-gray-900"
            :aria-expanded="isTeachingsOpen"
          >
            Teachings
            <Icon
              icon="mdi:chevron-down"
              class="text-base transition-transform duration-200"
              :class="{ 'rotate-180': isTeachingsOpen }"
            />
          </button>

          <!-- Mega Menu Dropdown -->
          <Transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="opacity-0 translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 translate-y-1"
          >
            <div
            v-if="isTeachingsOpen"
              class="absolute right-0 top-full mt-3 w-max rounded-2xl border border-gray-100 bg-white p-5 shadow-xl"
              @mouseenter="openTeachings"
              @mouseleave="closeTeachings"
            >
              <div class="flex gap-5">
                <!-- Featured post -->
                <div class="flex">
                  <div class="h-full rounded-2xl overflow-hidden bg-gray-100">
                      <img
                        src="https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=300&q=80"
                        alt="Open Bible"
                        class="h-[230px] w-[230px] object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  <div class="my-auto mx-4 flex flex-col gap-2">
                    <span class="text-black font-['Montserrat'] text-[16px] font-normal leading-[145%]">Latest upload</span>
                    <h3
                      class="text-[#181D27] font-['Crimson_Text'] text-[32px] font-semibold leading-[120%] tracking-[-0.64px] max-w-[372px] mt-1 mb-6"
                    >
                      This Week's Teaching: The Power of Grace
                    </h3>
                    <span
                      class="text-xs font-semibold text-sky-500 group-hover:underline cursor-pointer hover:underline transition-all duration-200"
                      >Read More</span
                    >
                  </div>
                </div>

                <!-- Categories -->
                <div class="flex flex-1 flex-col justify-center gap-4">
                  <a
                    v-for="cat in teachingCategories"
                    :key="cat.label"
                    :href="cat.href"
                    class="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50"
                  >
                    <div
                      class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-50"
                    >
                      <Icon :icon="cat.icon" class="text-lg text-sky-500" />
                    </div>
                    <div>
                      <p class="text-sm font-semibold text-gray-900">
                        {{ cat.label }}
                      </p>
                      <p class="text-xs text-gray-500">{{ cat.description }}</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </Transition>
        </li>
      </ul>

      <!-- Mobile hamburger -->
      <button
        class="flex items-center justify-center rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
        :aria-expanded="isMenuOpen"
        aria-label="Toggle menu"
        @click="toggleMenu"
      >
        <Icon :icon="isMenuOpen ? 'mdi:close' : 'mdi:menu'" class="text-2xl" />
      </button>
    </nav>

    <!-- Mobile Menu -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="isMenuOpen"
        class="border-t border-gray-100 bg-white lg:hidden"
      >
        <div class="mx-auto max-w-7xl px-4 py-4 sm:px-6">
          <ul class="flex flex-col gap-1">
            <li v-for="link in navLinks" :key="link.label">
              <a
                :href="link.href"
                class="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                @click="isMenuOpen = false"
              >
                {{ link.label }}
              </a>
            </li>

            <!-- Teachings accordion on mobile -->
            <li>
              <button
                class="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                @click="isTeachingsOpen = !isTeachingsOpen"
              >
                Teachings
                <Icon
                  icon="mdi:chevron-down"
                  class="text-base transition-transform duration-200"
                  :class="{ 'rotate-180': isTeachingsOpen }"
                />
              </button>
              <Transition
                enter-active-class="transition duration-150 ease-out"
                enter-from-class="opacity-0"
                enter-to-class="opacity-100"
                leave-active-class="transition duration-100 ease-in"
                leave-from-class="opacity-100"
                leave-to-class="opacity-0"
              >
                <ul
                  v-if="isTeachingsOpen"
                  class="mt-1 flex flex-col gap-1 pl-4"
                >
                  <li>
                    <a
                      href="/teachings/latest"
                      class="block rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      @click="isMenuOpen = false"
                    >
                      Latest Upload
                    </a>
                  </li>
                  <li v-for="cat in teachingCategories" :key="cat.label">
                    <a
                      :href="cat.href"
                      class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      @click="isMenuOpen = false"
                    >
                      <Icon :icon="cat.icon" class="text-sky-500" />
                      {{ cat.label }}
                    </a>
                  </li>
                </ul>
              </Transition>
            </li>
          </ul>
        </div>
      </div>
    </Transition>
  </header>
</template>
