import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Avatar from '~/components/ui/Avatar.vue'

/**
 * The nominal roll passes `member.avatar` straight through to this component,
 * so "member photos don't show" is nearly always a bug in one of these paths.
 */
describe('Avatar', () => {
  it('renders the photo when a src is supplied', () => {
    const wrapper = mount(Avatar, {
      props: { src: 'https://example.com/grace.webp', name: 'Grace Etim' },
    })

    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('https://example.com/grace.webp')
    expect(img.attributes('alt')).toBe('Grace Etim')
  })

  it('falls back to initials when no src is supplied', () => {
    const wrapper = mount(Avatar, { props: { name: 'Grace Etim' } })

    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.text()).toBe('GE')
  })

  it('treats an empty src as no photo', () => {
    const wrapper = mount(Avatar, { props: { src: '', name: 'Grace Etim' } })

    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.text()).toBe('GE')
  })

  it('falls back to initials when the image fails to load', async () => {
    const wrapper = mount(Avatar, {
      props: { src: 'https://example.com/deleted.webp', name: 'Grace Etim' },
    })

    await wrapper.find('img').trigger('error')

    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.text()).toBe('GE')
  })

  it('retries when the src changes after a failure', async () => {
    const wrapper = mount(Avatar, {
      props: { src: 'https://example.com/deleted.webp', name: 'Grace Etim' },
    })
    await wrapper.find('img').trigger('error')
    expect(wrapper.find('img').exists()).toBe(false)

    await wrapper.setProps({ src: 'https://example.com/replacement.webp' })

    expect(wrapper.find('img').attributes('src')).toBe('https://example.com/replacement.webp')
  })

  it('shows a placeholder when there is no name either', () => {
    const wrapper = mount(Avatar, {})
    expect(wrapper.text()).toBe('?')
  })
})
