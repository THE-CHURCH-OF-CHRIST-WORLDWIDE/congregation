<script setup lang="ts">
import { Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import type { ChartData, ChartOptions } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

interface Props {
  data: ChartData<'doughnut'>
  options?: ChartOptions<'doughnut'>
  height?: number
}
const props = withDefaults(defineProps<Props>(), { height: 220 })

const defaultOptions: ChartOptions<'doughnut'> = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '65%',
  plugins: {
    legend: {
      position: 'right',
      labels: {
        usePointStyle: true,
        boxWidth: 8,
        font: { size: 11 },
        color: '#d1d5db',
      },
    },
    tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.parsed}%` } },
  },
}

const mergedOptions = computed(() => ({ ...defaultOptions, ...props.options }))
</script>

<template>
  <div class="chart-container" :style="{ height: `${height}px` }">
    <Doughnut :data="data" :options="mergedOptions" />
  </div>
</template>
