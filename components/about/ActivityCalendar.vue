<script setup lang="ts">
interface ActivityRow {
  day: string
  activity: string
  time: string
}

const rows: ActivityRow[] = [
  { day: 'Every Sunday', activity: 'Bible Class', time: '7:30 AM' },
  { day: 'Every Sunday', activity: "Lord's Supper", time: '9:00 AM' },
  { day: 'Every Sunday', activity: 'Morning Worship', time: '10:00 AM' },
  { day: 'Every Sunday', activity: 'Evening Service', time: '5:00 PM' },
  { day: 'Every Wednesday', activity: 'Bible Study', time: '5:00 PM' },
  { day: 'Every Friday', activity: 'Evangelism', time: '4:00 PM' },
  { day: 'Every Friday', activity: 'Prayer Meeting', time: '6:00 PM' },
  { day: 'First Saturday', activity: "Women's Class", time: '10:00 AM' },
]
</script>

<template>
  <section class="bg-[#F8F9FA] py-16">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-10 text-center">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Schedule</p>
        <h2 class="mt-2 font-serif text-3xl font-bold text-gray-900">Our Activity Calendar</h2>
        <p class="mx-auto mt-3 max-w-md text-sm text-gray-500">
          All activities are held at the church auditorium unless otherwise announced.
        </p>
      </div>

      <!-- Table card -->
      <div class="mx-auto max-w-[680px] overflow-hidden rounded-xl bg-white shadow-sm">
        <table class="w-full text-sm">
          <!-- Header -->
          <thead>
            <tr class="bg-navy text-white">
              <th class="py-3.5 px-6 text-left font-medium tracking-wide">Day</th>
              <th class="py-3.5 px-6 text-left font-medium tracking-wide">Activity</th>
              <th class="py-3.5 px-6 text-left font-medium tracking-wide">Time</th>
            </tr>
          </thead>

          <!-- Body -->
          <tbody>
            <tr
              v-for="(row, i) in rows"
              :key="i"
              :class="i % 2 === 0 ? 'bg-white' : 'bg-gray-50'"
            >
              <td class="py-3 px-6 text-gray-600">{{ row.day }}</td>
              <td class="py-3 px-6 font-medium text-gray-900">{{ row.activity }}</td>
              <td class="py-3 px-6 text-gray-600">{{ row.time }}</td>
            </tr>

            <!-- Footer row -->
            <tr class="border-t border-gray-100 bg-white">
              <td colspan="3" class="py-3.5 px-6 text-center">
                <NuxtLink
                  to="/about-us"
                  class="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Get more information &rarr;
                </NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>
