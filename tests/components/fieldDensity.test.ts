import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import Input from '~/components/ui/Input.vue'
import SettingsSection from '~/components/settings/SettingsSection.vue'

describe('field density', () => {
  it('defaults to md', () => {
    const w = mount(Input, { props: { label: 'A' } })
    expect(w.find('input').classes().join(' ')).toContain('py-2')
  })
  it('honours an explicit size', () => {
    const w = mount(Input, { props: { label: 'A', size: 'sm' } })
    expect(w.find('input').classes().join(' ')).toContain('py-1.5')
  })
  it('inherits density from the surrounding section', () => {
    const w = mount(SettingsSection, {
      props: { title: 'T', density: 'sm' },
      slots: { default: () => h(Input, { label: 'A' }) },
      global: { stubs: { Card: { template: '<div><slot /></div>' }, Icon: true } },
    })
    expect(w.find('input').classes().join(' ')).toContain('py-1.5')
  })
  it('lets a field override inherited density', () => {
    const w = mount(SettingsSection, {
      props: { title: 'T', density: 'sm' },
      slots: { default: () => h(Input, { label: 'A', size: 'md' }) },
      global: { stubs: { Card: { template: '<div><slot /></div>' }, Icon: true } },
    })
    expect(w.find('input').classes().join(' ')).toContain('py-2')
  })
})
