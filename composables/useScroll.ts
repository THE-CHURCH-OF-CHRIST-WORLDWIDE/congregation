export function useScroll() {
  const scrollY = ref(0)

  const handleScroll = () => {
    scrollY.value = window.scrollY
  }

  onMounted(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    scrollY.value = window.scrollY
  })

  onBeforeUnmount(() => {
    window.removeEventListener('scroll', handleScroll)
  })

  const isScrolled = computed(() => scrollY.value > 50)

  return { scrollY, isScrolled }
}
