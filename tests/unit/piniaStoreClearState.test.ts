import { describe, expect, it } from 'vitest'
import { createPinia, defineStore, setActivePinia } from 'pinia'
import piniaStoreClearState from '../../src/functions/piniaStoreClearState'
import { ref } from 'vue'

describe('piniaStoreClearState()', async () => {

  it('correctly clears store state', async () => {

    const pinia = createPinia()
    setActivePinia(pinia)

    const storeId = 'store-id'
    const store = defineStore(storeId, () => {
      const name = ref('foo')
      return {
        name,
      }
    })()

    expect(pinia.state.value[storeId]).toBe(store.$state)

    piniaStoreClearState(store)

    expect(pinia.state.value[storeId]).toBe(undefined)
  })
})