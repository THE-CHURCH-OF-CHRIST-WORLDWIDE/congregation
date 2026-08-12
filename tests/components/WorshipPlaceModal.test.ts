import { describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import WorshipPlaceModal from '~/components/attendance/WorshipPlaceModal.vue'

const stubs = {
  Icon: true,
  Modal: {
    props: ['modelValue', 'title'],
    template: '<div v-if="modelValue"><slot /><slot name="footer" /></div>',
  },
  EditField: {
    props: ['label', 'error'],
    template: '<label>{{ label }}<slot /><span v-if="error" class="err">{{ error }}</span></label>',
  },
}

function render() {
  return mount(WorshipPlaceModal, { props: { modelValue: true }, global: { stubs } })
}

const radio = (w: ReturnType<typeof render>, value: string) =>
  w.find(`input[type="radio"][value="${value}"]`)
const submit = (w: ReturnType<typeof render>) =>
  w.findAll('button').find((b) => b.text().includes('Mark Present'))!
const cancelButton = (w: ReturnType<typeof render>) =>
  w.findAll('button').find((b) => b.text().includes('Cancel'))!

describe('WorshipPlaceModal', () => {
  /** The answer almost every time, so it must cost one click. */
  it('defaults to the local congregation and asks nothing further', async () => {
    const w = render()
    await flushPromises()

    expect((radio(w, 'local').element as HTMLInputElement).checked).toBe(true)
    expect(w.find('input[type="text"]').exists()).toBe(false)

    await submit(w).trigger('click')
    expect(w.emitted('confirm')?.[0]).toEqual([{ place: 'local' }])
  })

  it('asks for the congregation and certificate once elsewhere is chosen', async () => {
    const w = render()
    await radio(w, 'elsewhere').setValue()
    await flushPromises()

    const inputs = w.findAll('input[type="text"]')
    expect(inputs.length).toBe(2)

    await inputs[0]!.setValue('Church of Christ, Uyo')
    await inputs[1]!.setValue('signed by Bro. Udo Effiong')
    await submit(w).trigger('click')

    expect(w.emitted('confirm')?.[0]).toEqual([
      {
        place: 'elsewhere',
        congregation: 'Church of Christ, Uyo',
        certificate: true,
        certificateRef: 'signed by Bro. Udo Effiong',
      },
    ])
  })

  /** "Worshipped elsewhere" with no congregation is not a record of anything. */
  it('refuses to confirm elsewhere without naming the congregation', async () => {
    const w = render()
    await radio(w, 'elsewhere').setValue()
    await submit(w).trigger('click')

    expect(w.emitted('confirm')).toBeUndefined()
    expect(w.find('.err').text()).toContain('Name the congregation')
  })

  it('records a reported visit whose certificate has not been produced', async () => {
    const w = render()
    await radio(w, 'elsewhere').setValue()
    await w.find('input[type="text"]').setValue('Church of Christ, Uyo')
    await w.find('input[type="checkbox"]').setValue(false)
    await submit(w).trigger('click')

    expect(w.emitted('confirm')?.[0]?.[0]).toMatchObject({ certificate: false })
  })

  it('omits a blank certificate reference rather than storing an empty string', async () => {
    const w = render()
    await radio(w, 'elsewhere').setValue()
    await w.find('input[type="text"]').setValue('Church of Christ, Uyo')
    await submit(w).trigger('click')

    expect(w.emitted('confirm')?.[0]?.[0]).toMatchObject({ certificateRef: undefined })
  })

  it('emits cancel without confirming, so the caller can put the tick back', async () => {
    const w = render()
    await cancelButton(w).trigger('click')

    expect(w.emitted('cancel')).toBeTruthy()
    expect(w.emitted('confirm')).toBeUndefined()
    expect(w.emitted('update:modelValue')?.at(-1)).toEqual([false])
  })

  /** One instance is reused for every row, so a previous answer must not leak into the next. */
  it('resets each time it opens', async () => {
    const w = render()
    await radio(w, 'elsewhere').setValue()
    await w.find('input[type="text"]').setValue('Church of Christ, Uyo')

    await w.setProps({ modelValue: false })
    await w.setProps({ modelValue: true })
    await flushPromises()

    expect((radio(w, 'local').element as HTMLInputElement).checked).toBe(true)
    expect(w.find('input[type="text"]').exists()).toBe(false)
  })
})
