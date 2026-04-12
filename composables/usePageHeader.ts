export function usePageHeader() {
  const title = useState<string>('page-header-title', () => 'Dashboard')
  const subtitle = useState<string>('page-header-subtitle', () => '')

  function setHeader(t: string, s = '') {
    title.value = t
    subtitle.value = s
  }

  return { title, subtitle, setHeader }
}
