<template>
  <section class="min-h-screen bg-slate-100/60">
    <div class="py-20">
      <div class="flex justify-center">
        <div
          class="w-full max-w-7xl bg-white/80 rounded-2xl shadow-[0_-20px_60px_rgba(59,130,246,0.25),0_10px_40px_rgba(0,0,0,0.08)] backdrop-blur-sm p-10"
        >
          <div class="px-8 pb-6 pt-10 text-center">
            <h1
              class="text-[#252B37] text-center font-['Crimson_Text'] text-[132px] font-bold leading-[120%] tracking-[-5.28px]"
            >
              {{ name }}
            </h1>
            <p
              class="text-[#535862] text-center font-['Crimson_Text'] text-[48px] font-semibold leading-[100%] tracking-[-1.92px] opacity-70 mb-30"
            >
              {{ address }}
            </p>
          </div>
        </div>
      </div>
      <div class="-mt-45 relative z-10 w-full">
        <img
          v-if="imageUrl"
          :src="imageUrl"
          :alt="name"
          class="h-[420px] w-full object-cover object-center"
        />
        <div v-else class="flex w-full items-center justify-center">
          <img
            src="/images/heroImg.png"
            alt="church hero"
            class="h-full w-full object-fit object-center"
          />
        </div>
      </div>
    </div>
    <div class="flex flex-row justify-center -mt-45 relative z-10">
      <div class="flex justify-center w-full max-w-7xl">
        <div>1</div>
        <div>2</div>
        <div>3</div>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
defineProps<{
  name: string;
  address: string;
  imageUrl: string;
}>();
</script>