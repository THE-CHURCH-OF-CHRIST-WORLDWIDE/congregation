import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import ContactForm from '~/components/home/ContactForm.vue'
import { useMessagesStore } from '~/stores/messages'

/**
 * This form used to announce "Message Sent!" after a 900ms timer, having sent nothing. These
 * tests are mostly about that: the success state must follow a real write, and a failed one
 * must keep what the visitor typed on screen rather than clearing it.
 */
let failWrite = false
const createMessage = vi.fn(async () => {
  if (failWrite) throw new Error('Missing or insufficient permissions.')
})

vi.mock('~/repositories/messagesRepository', () => ({
  useMessagesRepository: () => ({
    fetchMessages: async () => [],
    createMessage,
    updateMessage: vi.fn(),
    deleteMessage: vi.fn(),
  }),
}))

vi.mock('~/repositories/churchSettingsRepository', () => ({
  useChurchSettingsRepository: () => ({ fetchSettings: async () => null, saveSettings: vi.fn() }),
}))

mockNuxtImport('useNuxtApp', () => () => ({ $auth: {}, $firestore: {} }))

const stubs = {
  Icon: true,
  MapEmbed: true,
  // Passthrough: the real Transition uses mode="out-in", so the form would not be back in the
  // DOM synchronously after leaving the success state.
  Transition: { template: '<div><slot /></div>' },
}

function fill(wrapper: ReturnType<typeof mount>) {
  return Promise.all([
    wrapper.find('#cf-name').setValue('Ubong'),
    wrapper.find('#cf-email').setValue('ubong@example.com'),
    wrapper.find('#cf-phone').setValue('+2348000000000'),
    wrapper.find('#cf-message').setValue('Please can someone visit my mother.'),
  ])
}

beforeEach(() => {
  setActivePinia(createPinia())
  failWrite = false
  createMessage.mockClear()
})

describe('ContactForm', () => {
  it('collects a phone number', () => {
    const wrapper = mount(ContactForm, { global: { stubs } })

    const phone = wrapper.find('#cf-phone')
    expect(phone.exists()).toBe(true)
    expect(phone.attributes('type')).toBe('tel')
    // Labelled, not just placeholdered — a placeholder disappears as soon as you type.
    expect(wrapper.find('label[for="cf-phone"]').text()).toMatch(/phone/i)
  })

  it('sends what was typed, phone included', async () => {
    const wrapper = mount(ContactForm, { global: { stubs } })
    await fill(wrapper)
    await wrapper.find('form').trigger('submit')

    expect(createMessage).toHaveBeenCalledWith({
      name: 'Ubong',
      email: 'ubong@example.com',
      phone: '+2348000000000',
      message: 'Please can someone visit my mother.',
    })
  })

  it('only claims success once the message is actually written', async () => {
    const wrapper = mount(ContactForm, { global: { stubs } })
    await fill(wrapper)
    await wrapper.find('form').trigger('submit')
    await new Promise((r) => setTimeout(r, 0))

    expect(wrapper.text()).toContain('Message Sent!')
  })

  it('reports a failure instead of announcing success', async () => {
    failWrite = true
    const wrapper = mount(ContactForm, { global: { stubs } })
    await fill(wrapper)
    await wrapper.find('form').trigger('submit')
    await new Promise((r) => setTimeout(r, 0))

    expect(wrapper.text()).not.toContain('Message Sent!')
    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
  })

  it('keeps what was typed when sending fails', async () => {
    failWrite = true
    const wrapper = mount(ContactForm, { global: { stubs } })
    await fill(wrapper)
    await wrapper.find('form').trigger('submit')
    await new Promise((r) => setTimeout(r, 0))

    // Clearing the form here would lose a message the visitor cannot recover.
    expect((wrapper.find('#cf-message').element as HTMLTextAreaElement).value).toBe(
      'Please can someone visit my mother.'
    )
  })

  it('does not resend the previous message after a success', async () => {
    const wrapper = mount(ContactForm, { global: { stubs } })
    await fill(wrapper)
    await wrapper.find('form').trigger('submit')
    await new Promise((r) => setTimeout(r, 0))

    await wrapper.find('button.text-accent').trigger('click')
    expect((wrapper.find('#cf-name').element as HTMLInputElement).value).toBe('')
  })

  it('disables the button while sending', async () => {
    const wrapper = mount(ContactForm, { global: { stubs } })
    useMessagesStore().submitting = true
    await nextTick()

    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined()
  })
})
