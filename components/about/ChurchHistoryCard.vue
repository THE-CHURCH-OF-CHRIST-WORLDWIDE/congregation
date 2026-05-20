<script setup lang="ts">
const schedule = [
  { label: 'Bible Class — Every Sunday', time: '7:30 AM' },
  { label: "Lord's Supper / Communion — Every Sunday", time: '9:00 AM' },
  { label: 'Morning Worship — Every Sunday', time: '10:00 AM' },
  { label: 'Evening Service — Every Sunday', time: '5:00 PM' },
  { label: 'Bible Study — Every Wednesday', time: '5:00 PM' },
  { label: 'Evangelism — Every Friday', time: '4:00 PM' },
]

const cornerImages = [
  { seed: 'history-tl', pos: 'absolute -top-8 -left-8' },
  { seed: 'history-tr', pos: 'absolute -top-8 -right-8' },
  { seed: 'history-bl', pos: 'absolute -bottom-8 -left-8' },
  { seed: 'history-br', pos: 'absolute -bottom-8 -right-8' },
]
</script>

<template>
  <section class="bg-white py-20">
    <div class="mx-auto max-w-4xl px-4 sm:px-8 lg:px-8">
      <!-- Outer wrapper that gives room for overflowing corner images -->
      <div class="relative px-4 pt-10 pb-10 md:px-10">
        <!-- Corner decorative images (desktop only) -->
        <img
          v-for="img in cornerImages"
          :key="img.seed"
          :src="`https://picsum.photos/seed/${img.seed}/200/200`"
          alt=""
          :class="[
            img.pos,
            'z-10 hidden h-20 w-20 rounded-full object-cover ring-4 ring-white shadow-lg md:block',
          ]"
        />

        <!-- Paper card -->
        <div
          class="rounded-xl border border-amber-100 bg-[#FDFCF8] px-6 py-10 shadow-md sm:px-10 sm:py-12"
        >
          <!-- Eyebrow -->
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">History</p>

          <!-- Heading -->
          <h2 class="mt-2 text-lg font-bold leading-snug text-gray-900 md:text-xl">
            A BRIEF HISTORY OF THE CHURCH OF CHRIST,<br class="hidden sm:block" />
            7B ESA ATAN EXTENSION.
          </h2>

          <!-- Opening paragraph -->
          <p class="mt-6 text-sm leading-relaxed text-gray-700">
            The Church of Christ at 7b Esa Atan Extension, Ikot Ekpene, Akwa Ibom State, was
            established in the year 2003 by a group of faithful brethren committed to the
            restoration of New Testament Christianity. Beginning with a small nucleus of seven
            members who gathered for worship before the construction of the current auditorium, the
            congregation has grown steadily under the guidance of God's word. The church is
            identified by the authority of the Scriptures alone, observing the New Testament pattern
            of worship and organisation as established by the apostles in the first century.
          </p>

          <!-- Founders list -->
          <p class="mt-7 font-semibold text-gray-800">
            Founding members and early leaders include:
          </p>
          <ol class="mt-2 list-decimal space-y-1.5 pl-6 text-sm text-gray-700">
            <li>Bro. Akpan Ekom — Elder (Founding overseer)</li>
            <li>Bro. Emmanuel Okon — Minister (Inaugural preacher)</li>
            <li>Bro. Chris Ikutte — Deacon</li>
            <li>Bro. Chiedu Nwosu — Deacon</li>
            <li>Bro. Tunde Adikwu — Deacon</li>
            <li>Sis. Grace Okon — Women's Class Co-ordinator</li>
          </ol>

          <!-- Growth paragraph -->
          <p class="mt-7 text-sm leading-relaxed text-gray-700">
            Through the faithful preaching of the gospel, the congregation grew from its seven
            founding members to an active membership of over two hundred and forty souls. A
            permanent worship building was completed and dedicated in 2010, and a parsonage was
            added in 2017. The congregation supports domestic and international evangelism, funds
            several gospel meetings annually, and maintains a thriving Bible school programme for
            both youth and adults.
          </p>

          <!-- Services schedule mini-table -->
          <div class="mt-8">
            <p class="mb-3 text-sm font-semibold text-gray-800">Regular Meeting Schedule:</p>
            <div class="overflow-hidden rounded-lg border border-gray-100">
              <div
                v-for="(row, i) in schedule"
                :key="i"
                :class="[
                  'grid grid-cols-[1fr_auto] items-center gap-4 px-5 py-2.5 text-sm',
                  i % 2 === 0 ? 'bg-white' : 'bg-gray-50',
                ]"
              >
                <span class="text-gray-700">{{ row.label }}</span>
                <span class="font-semibold whitespace-nowrap text-gray-900">{{ row.time }}</span>
              </div>
            </div>
          </div>

          <!-- Closing paragraph -->
          <p class="mt-8 text-sm leading-relaxed text-gray-700">
            We extend a warm and open invitation to all who seek to worship God in spirit and in
            truth. Whether you are a member of the Churches of Christ, a visitor to Ikot Ekpene, or
            someone searching for a congregation rooted in the New Testament pattern, you are most
            welcome to worship with us. Come, let us reason together from the Scriptures.
          </p>

          <!-- Signature block -->
          <div class="mt-8 border-t border-gray-200 pt-6">
            <p class="font-semibold text-gray-900">Bro. Basiri Goody</p>
            <p class="mt-0.5 text-xs text-gray-500">
              Minister — Church of Christ, 7b Esa Atan Extension
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
