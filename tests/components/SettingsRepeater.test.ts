import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import SettingsRepeater from '~/components/settings/SettingsRepeater.vue'

interface Row {
  day: string
}

const stubs = { Icon: true }

describe('SettingsRepeater', () => {
  const rows = [{ day: 'Sunday' }, { day: 'Wednesday' }]

  it('states the column headings once, not per row', () => {
    const wrapper = mount(SettingsRepeater, {
      props: { items: rows, columns: ['Day', 'Activity', 'Time'], gridClass: 'x' },
      global: { stubs },
    })

    // Three headings for two rows — the whole point of the component.
    expect(wrapper.text().match(/Day/g)).toHaveLength(1)
  })

  it('renders one row per item with its own remove control', () => {
    const wrapper = mount(SettingsRepeater, {
      props: { items: rows, gridClass: 'x', noun: 'calendar row' },
      global: { stubs, plugins: [] },
      // The component's generic does not flow into a manually supplied slot, so narrow here.
      slots: { default: (props: { item: unknown }) => h('span', (props.item as Row).day) },
    })

    const buttons = wrapper.findAll('button')
    expect(buttons).toHaveLength(2)
    // Accessible names are 1-based and name what is being removed.
    expect(buttons[0]!.attributes('aria-label')).toBe('Remove calendar row 1')
    expect(buttons[1]!.attributes('aria-label')).toBe('Remove calendar row 2')
  })

  it('emits the index of the row to remove', async () => {
    const wrapper = mount(SettingsRepeater, {
      props: { items: rows, gridClass: 'x' },
      global: { stubs },
    })

    await wrapper.findAll('button')[1]!.trigger('click')
    expect(wrapper.emitted('remove')).toEqual([[1]])
  })

  it('shows an empty state instead of a bare list', () => {
    const wrapper = mount(SettingsRepeater, {
      props: { items: [], gridClass: 'x', empty: 'No calendar rows added yet.' },
      global: { stubs },
    })

    expect(wrapper.text()).toContain('No calendar rows added yet.')
    expect(wrapper.findAll('button')).toHaveLength(0)
  })

  it('omits the heading row when no columns are given', () => {
    const wrapper = mount(SettingsRepeater, {
      props: { items: rows, gridClass: 'x' },
      global: { stubs },
    })

    expect(wrapper.find('[aria-hidden="true"]').exists()).toBe(false)
  })
})
