/**
 * A live countdown to a fixed target date, ticking once a second while the calling component is
 * mounted. Stops and cleans up its timer automatically on unmount.
 */
export function useCountdown(target: Date | string) {
  const targetTime = new Date(target).getTime()
  const now = ref(Date.now())
  let timer: ReturnType<typeof setInterval> | undefined

  onMounted(() => {
    timer = setInterval(() => {
      now.value = Date.now()
    }, 1000)
  })

  onUnmounted(() => {
    if (timer) clearInterval(timer)
  })

  const remainingMs = computed(() => Math.max(0, targetTime - now.value))
  const isPast = computed(() => targetTime <= now.value)

  const days = computed(() => Math.floor(remainingMs.value / 86_400_000))
  const hours = computed(() => Math.floor((remainingMs.value % 86_400_000) / 3_600_000))
  const minutes = computed(() => Math.floor((remainingMs.value % 3_600_000) / 60_000))
  const seconds = computed(() => Math.floor((remainingMs.value % 60_000) / 1000))

  return { days, hours, minutes, seconds, isPast }
}
