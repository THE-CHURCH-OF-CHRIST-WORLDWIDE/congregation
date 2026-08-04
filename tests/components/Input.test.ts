import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import Input from '~/components/ui/Input.vue'
import Select from '~/components/ui/Select.vue'

/**
 * The label sits beside the control rather than wrapping it, so the `for`/`id` pair is the
 * only thing associating them. Without it, clicking a label does not focus its field and
 * assistive technology announces every input in the app as unnamed.
 */
describe('Input accessibility', () => {
  it('associates its label with the input', () => {
    const wrapper = mount(Input, { props: { label: 'Church Name' } })

    const id = wrapper.find('input').attributes('id')
    expect(id).toBeTruthy()
    expect(wrapper.find('label').attributes('for')).toBe(id)
  })

  // useId() counts per app instance, so uniqueness has to be checked within one mount —
  // which is also the case that matters: two fields on the same form must not collide.
  it('gives every field on a form its own id', () => {
    const form = {
      render: () => h('div', [h(Input, { label: 'One' }), h(Input, { label: 'Two' })]),
    }
    const wrapper = mount(form)

    const ids = wrapper.findAll('input').map((input) => input.attributes('id'))
    const labelFor = wrapper.findAll('label').map((label) => label.attributes('for'))

    expect(ids).toHaveLength(2)
    expect(new Set(ids).size).toBe(2)
    expect(labelFor).toEqual(ids)
  })

  it('points the input at its error message and marks it invalid', () => {
    const wrapper = mount(Input, { props: { label: 'Email', error: 'Enter a valid email' } })

    const input = wrapper.find('input')
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(input.attributes('aria-describedby')).toBe(wrapper.find('p').attributes('id'))
  })

  it('describes the input with helper text and stays valid', () => {
    const wrapper = mount(Input, { props: { label: 'Phone', helper: 'Include country code' } })

    const input = wrapper.find('input')
    expect(input.attributes('aria-invalid')).toBeUndefined()
    expect(input.attributes('aria-describedby')).toBe(wrapper.find('p').attributes('id'))
  })

  it('leaves aria-describedby off when there is nothing to describe', () => {
    const wrapper = mount(Input, { props: { label: 'Address' } })

    expect(wrapper.find('input').attributes('aria-describedby')).toBeUndefined()
  })
})

describe('Select accessibility', () => {
  const options = [
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
  ]

  it('associates its label with the select', () => {
    const wrapper = mount(Select, { props: { label: 'Gender', options } })

    const id = wrapper.find('select').attributes('id')
    expect(id).toBeTruthy()
    expect(wrapper.find('label').attributes('for')).toBe(id)
  })

  it('points the select at its error message', () => {
    const wrapper = mount(Select, { props: { label: 'Gender', options, error: 'Pick one' } })

    const select = wrapper.find('select')
    expect(select.attributes('aria-invalid')).toBe('true')
    expect(select.attributes('aria-describedby')).toBe(wrapper.find('p').attributes('id'))
  })
})
