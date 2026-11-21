import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import MinuteItemsEditor from '~/components/business-meetings/MinuteItemsEditor.vue'
import { newMinuteItem } from '~/utils/businessMeetings'
import type { MinuteItem } from '~/types/businessMeetings'

async function mountWith(items: MinuteItem[]) {
  const updates: MinuteItem[][] = []
  const w = await mountSuspended(MinuteItemsEditor, {
    props: {
      items,
      noun: 'Report',
      idPrefix: 'rp',
      'onUpdate:items': (v: MinuteItem[]) => updates.push(v),
    },
  })
  return { w, updates }
}

describe('MinuteItemsEditor', () => {
  it('adds an empty item', async () => {
    const { w, updates } = await mountWith([])
    await w
      .findAll('button')
      .find((b) => b.text().includes('Add report'))!
      .trigger('click')
    expect(updates.at(-1)).toHaveLength(1)
    expect(updates.at(-1)![0]!.title).toBe('')
  })

  it('moves and removes items', async () => {
    const a = { ...newMinuteItem('rp'), title: 'A' }
    const b = { ...newMinuteItem('rp'), title: 'B' }
    const { w, updates } = await mountWith([a, b])
    await w.find('[aria-label="Move report 2 up"]').trigger('click')
    expect(updates.at(-1)!.map((i) => i.title)).toEqual(['B', 'A'])
    await w.find('[aria-label="Remove report 1"]').trigger('click')
    expect(updates.at(-1)!.map((i) => i.title)).toEqual(['B'])
  })
})
