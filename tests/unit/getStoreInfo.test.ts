import { describe, expect, it } from 'vitest'
import { NameStore_ID, useNameStore } from '../helpers/test-stores'
import { createPinia, defineStore, setActivePinia } from 'pinia'
import { attachPiniaScope } from '../../src/pinia-scope'
import { getStoreInfo, getStoreScope, getStoreUnscopedId } from '../../src/functions/getStoreInfo'

describe('getStoreInfo', () => {
  it('undefined when not attached', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)

    const useFooStore = defineStore('foo', () => {
    })
    const store = useFooStore()
    const { unscopedId, scope } = getStoreInfo(store)
    expect(unscopedId).toBe(undefined)
    expect(scope).toBe(undefined)

    expect(getStoreUnscopedId(store)).toBe(undefined)
    expect(getStoreScope(store)).toBe(undefined)
  })

  it('getStoreInfo() without scope', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    attachPiniaScope(pinia)

    const store = useNameStore()
    const { unscopedId, scope } = getStoreInfo(store)
    expect(unscopedId).toBe(NameStore_ID)
    expect(scope).toBe('')
    expect(getStoreUnscopedId(store)).toBe(NameStore_ID)
    expect(getStoreScope(store)).toBe('')
  })

  it('getStoreInfo() with scope', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    attachPiniaScope(pinia)

    const SCOPE = 'scope'
    const store = useNameStore(SCOPE)

    const { unscopedId, scope } = getStoreInfo(store)
    expect(unscopedId).toBe(NameStore_ID)
    expect(scope).toBe(SCOPE)
    expect(getStoreUnscopedId(store)).toBe(NameStore_ID)
    expect(getStoreScope(store)).toBe(SCOPE)
  })
})