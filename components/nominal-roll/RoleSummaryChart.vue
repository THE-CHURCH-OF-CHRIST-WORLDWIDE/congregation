<script setup lang="ts">
import type { ChartData } from 'chart.js'

const membersStore = useMembersStore()

const chartData = computed<ChartData<'doughnut'>>(() => {
  const total = membersStore.members.length || 1
  const active = membersStore.activeCount
  const backsliders = membersStore.members.filter((m) => m.status === 'Backslider').length
  const distant = membersStore.members.filter((m) => m.status === 'Distant').length
  const withdrawal = membersStore.members.filter((m) => m.status === 'Withdrawal').length
  const weak = membersStore.members.filter((m) => m.status === 'Weak').length

  return {
    labels: ['Active', 'Backsliders', 'Distant', 'Withdrawal/Transfer', 'Weak'],
    datasets: [
      {
        data: [
          Math.round((active / total) * 100),
          Math.round((backsliders / total) * 100),
          Math.round((distant / total) * 100),
          Math.round((withdrawal / total) * 100),
          Math.round((weak / total) * 100),
        ],
        backgroundColor: ['#3b82f6', '#f59e0b', '#6366f1', '#ef4444', '#22c55e'],
        borderWidth: 0,
      },
    ],
  }
})

const currentYear = new Date().getFullYear()
</script>

<template>
  <Card class="bg-slate-800">
    <h3 class="text-sm font-semibold text-white mb-3">{{ currentYear }} Nominal Role Summary</h3>
    <DonutChart :data="chartData" :height="180" />
  </Card>
</template>
