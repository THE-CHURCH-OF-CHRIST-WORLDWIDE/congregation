<script setup lang="ts" generic="T extends string">
// Fourteen sections is more than a tab strip can hold without wrapping or scrolling
// sideways, so they live in a grouped sidebar on desktop and a native select on mobile.
interface NavItem {
  label: string
  value: T
  icon: string
}

const props = defineProps<{
  modelValue: T
  groups: { label: string; items: NavItem[] }[]
}>()

const emit = defineEmits<{ 'update:modelValue': [value: T] }>()

const current = computed(() =>
  props.groups.flatMap((group) => group.items).find((item) => item.value === props.modelValue)
)
</script>

<template>
  <!-- Mobile -->
  <div class="lg:hidden">
    <label for="settings-section" class="text-sm font-medium text-gray-700">Section</label>
    <div class="relative mt-1">
      <Icon
        v-if="current"
        :icon="current.icon"
        class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
      />
      <select
        id="settings-section"
        :value="modelValue"
        class="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-9 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value as T)"
      >
        <optgroup v-for="group in groups" :key="group.label" :label="group.label">
          <option v-for="item in group.items" :key="item.value" :value="item.value">
            {{ item.label }}
          </option>
        </optgroup>
      </select>
      <Icon
        icon="mdi:chevron-down"
        class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
      />
    </div>
  </div>

  <!-- Desktop -->
  <nav
    aria-label="Settings sections"
    class="hidden w-56 shrink-0 self-start lg:sticky lg:top-0 lg:block lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto"
  >
    <div v-for="(group, groupIndex) in groups" :key="group.label" :class="groupIndex > 0 && 'mt-5'">
      <p class="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
        {{ group.label }}
      </p>
      <ul class="space-y-0.5">
        <li v-for="item in group.items" :key="item.value">
          <button
            type="button"
            :aria-current="item.value === modelValue ? 'page' : undefined"
            :class="[
              'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors',
              item.value === modelValue
                ? 'bg-blue-50 font-medium text-blue-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
            ]"
            @click="emit('update:modelValue', item.value)"
          >
            <Icon
              :icon="item.icon"
              :class="[
                'shrink-0 text-[17px]',
                item.value === modelValue ? 'text-blue-600' : 'text-gray-400',
              ]"
            />
            <span class="truncate">{{ item.label }}</span>
          </button>
        </li>
      </ul>
    </div>
  </nav>
</template>
