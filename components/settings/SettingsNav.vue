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
    <label for="settings-section" class="text-sm font-medium text-ink">Section</label>
    <div class="relative mt-1">
      <Icon
        v-if="current"
        :icon="current.icon"
        class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-primary-ink"
      />
      <select
        id="settings-section"
        :value="modelValue"
        class="min-h-11 w-full appearance-none rounded-md border border-rule-strong bg-surface py-2.5 pr-9 pl-9 text-[15px] font-medium text-ink shadow-xs outline-none transition-[border-color,box-shadow] duration-150 hover:border-ink-subtle focus:border-primary focus:ring-3 focus:ring-primary/15 sm:text-sm"
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
        class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-subtle"
      />
    </div>
  </div>

  <!-- Desktop -->
  <nav
    aria-label="Settings sections"
    class="hidden w-56 shrink-0 self-start lg:sticky lg:top-0 lg:block lg:border-r lg:border-rule lg:pr-4 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto"
  >
    <div
      v-for="(group, groupIndex) in groups"
      :key="group.label"
      :class="groupIndex > 0 && 'mt-5 border-t border-rule pt-4'"
    >
      <p class="px-3 pb-1.5 text-2xs font-semibold tracking-[0.08em] text-ink-subtle uppercase">
        {{ group.label }}
      </p>
      <ul class="space-y-0.5">
        <li v-for="item in group.items" :key="item.value">
          <button
            type="button"
            :aria-current="item.value === modelValue ? 'page' : undefined"
            :class="[
              'flex min-h-9 w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors duration-150',
              item.value === modelValue
                ? 'bg-primary-soft font-semibold text-primary-ink'
                : 'font-medium text-ink-muted hover:bg-surface-sunken hover:text-ink',
            ]"
            @click="emit('update:modelValue', item.value)"
          >
            <Icon
              :icon="item.icon"
              :class="[
                'shrink-0 text-[17px]',
                item.value === modelValue ? 'text-primary-ink' : 'text-ink-subtle',
              ]"
            />
            <span class="truncate">{{ item.label }}</span>
          </button>
        </li>
      </ul>
    </div>
  </nav>
</template>
