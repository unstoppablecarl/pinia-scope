import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, Pinia, setActivePinia } from 'pinia'
import { makeStore } from '../helpers/test-stores'
import { attachPiniaScope, clearPiniaScope, getActivePiniaScopeTracker } from '../../src/pinia-scope'

const SCOPE_A = 'scope-a'
const SCOPE_B = 'scope-b'
const SCOPE_C = 'scope-c'

describe('getActivePiniaScopeTracker()', async () => {
  let pinia: Pinia

  beforeEach(() => {
    pinia = createPinia()
    clearPiniaScope(pinia)
    attachPiniaScope(pinia)
    setActivePinia(pinia)
  })

  it('tracks multiple scopes', async () => {
    const storeA1 = makeStore('store-A1')
    const storeA2 = makeStore('store-A2')
    const storeA1DisposeSpy = vi.spyOn(storeA1, '$dispose')
    const storeA2DisposeSpy = vi.spyOn(storeA2, '$dispose')

    const storeB1 = makeStore('store-B1')
    const storeB2 = makeStore('store-B2')
    const storeB1DisposeSpy = vi.spyOn(storeB1, '$dispose')
    const storeB2DisposeSpy = vi.spyOn(storeB2, '$dispose')

    expect(getActivePiniaScopeTracker().useCount(SCOPE_A)).toBe(0)
    expect(getActivePiniaScopeTracker().useCount(SCOPE_B)).toBe(0)

    getActivePiniaScopeTracker().addStore(SCOPE_A, storeA1)
    getActivePiniaScopeTracker().addStore(SCOPE_A, storeA2)

    getActivePiniaScopeTracker().addStore(SCOPE_B, storeB1)
    getActivePiniaScopeTracker().addStore(SCOPE_B, storeB2)

    getActivePiniaScopeTracker().mounted(SCOPE_A)
    getActivePiniaScopeTracker().mounted(SCOPE_A)

    getActivePiniaScopeTracker().mounted(SCOPE_B)

    expect(storeA1DisposeSpy).toHaveBeenCalledTimes(0)
    expect(storeA2DisposeSpy).toHaveBeenCalledTimes(0)

    expect(storeB1DisposeSpy).toHaveBeenCalledTimes(0)
    expect(storeB2DisposeSpy).toHaveBeenCalledTimes(0)

    getActivePiniaScopeTracker().unmounted(SCOPE_A)
    getActivePiniaScopeTracker().unmounted(SCOPE_A)

    expect(storeA1DisposeSpy).toHaveBeenCalledOnce()
    expect(storeA2DisposeSpy).toHaveBeenCalledOnce()

    expect(storeB1DisposeSpy).toHaveBeenCalledTimes(0)
    expect(storeB2DisposeSpy).toHaveBeenCalledTimes(0)

    expect(getActivePiniaScopeTracker().has(SCOPE_A)).toBe(false)
    expect(getActivePiniaScopeTracker().has(SCOPE_B)).toBe(true)

  })

  it('disposes of stores when autoDispose and autoClearState is default', async () => {
    const store1 = makeStore('store-1')
    const store2 = makeStore('store-2')
    const store1DisposeSpy = vi.spyOn(store1, '$dispose')
    const store2DisposeSpy = vi.spyOn(store2, '$dispose')

    getActivePiniaScopeTracker().addStore(SCOPE_A, store1)
    getActivePiniaScopeTracker().addStore(SCOPE_A, store2)

    getActivePiniaScopeTracker().mounted(SCOPE_A)
    getActivePiniaScopeTracker().mounted(SCOPE_A)
    getActivePiniaScopeTracker().unmounted(SCOPE_A)
    getActivePiniaScopeTracker().unmounted(SCOPE_A)

    expect(getActivePiniaScopeTracker().has(SCOPE_A)).toBe(false)

    expect(store1DisposeSpy).toHaveBeenCalledOnce()
    expect(store2DisposeSpy).toHaveBeenCalledOnce()

    expect(pinia.state.value[store1.$id]).toBe(undefined)
    expect(pinia.state.value[store2.$id]).toBe(undefined)
  })

  it('disposes of stores when autoDispose = true and autoClearState is default', async () => {
    const store1 = makeStore('store-1')
    const store2 = makeStore('store-2')
    const store1DisposeSpy = vi.spyOn(store1, '$dispose')
    const store2DisposeSpy = vi.spyOn(store2, '$dispose')

    getActivePiniaScopeTracker().init(SCOPE_A, { autoDispose: true })
    getActivePiniaScopeTracker().addStore(SCOPE_A, store1)
    getActivePiniaScopeTracker().addStore(SCOPE_A, store2)

    getActivePiniaScopeTracker().mounted(SCOPE_A)
    getActivePiniaScopeTracker().mounted(SCOPE_A)
    getActivePiniaScopeTracker().unmounted(SCOPE_A)
    getActivePiniaScopeTracker().unmounted(SCOPE_A)

    expect(getActivePiniaScopeTracker().has(SCOPE_A)).toBe(false)

    expect(store1DisposeSpy).toHaveBeenCalledOnce()
    expect(store2DisposeSpy).toHaveBeenCalledOnce()

    expect(pinia.state.value[store1.$id]).toBe(undefined)
    expect(pinia.state.value[store2.$id]).toBe(undefined)
  })

  it('does not dispose of stores until getActivePiniaScopeTracker().dispose() is called when autoDispose = false', async () => {
    const storeA1 = makeStore('store-A1')
    const storeA2 = makeStore('store-A2')

    const storeA1DisposeSpy = vi.spyOn(storeA1, '$dispose')
    const storeA2DisposeSpy = vi.spyOn(storeA2, '$dispose')

    getActivePiniaScopeTracker().init(SCOPE_A, { autoDispose: false })

    getActivePiniaScopeTracker().addStore(SCOPE_A, storeA1)
    getActivePiniaScopeTracker().addStore(SCOPE_A, storeA2)

    getActivePiniaScopeTracker().mounted(SCOPE_A)
    getActivePiniaScopeTracker().mounted(SCOPE_A)
    getActivePiniaScopeTracker().unmounted(SCOPE_A)
    getActivePiniaScopeTracker().unmounted(SCOPE_A)

    expect(getActivePiniaScopeTracker().has(SCOPE_A)).toBe(true)

    expect(storeA1DisposeSpy).toHaveBeenCalledTimes(0)
    expect(storeA2DisposeSpy).toHaveBeenCalledTimes(0)

    getActivePiniaScopeTracker().dispose(SCOPE_A)

    expect(storeA1DisposeSpy).toHaveBeenCalledOnce()
    expect(storeA2DisposeSpy).toHaveBeenCalledOnce()

    expect(pinia.state.value[storeA1.$id]).toBe(storeA1.$state)
    expect(pinia.state.value[storeA2.$id]).toBe(storeA2.$state)
  })

  it('does not dispose of stores until getActivePiniaScopeTracker().disposeAndClearState() is called when autoDispose = false and autoClearState = false', async () => {
    const storeA1 = makeStore('store-A1')
    const storeA2 = makeStore('store-A2')

    const storeA1DisposeSpy = vi.spyOn(storeA1, '$dispose')
    const storeA2DisposeSpy = vi.spyOn(storeA2, '$dispose')

    getActivePiniaScopeTracker().init(SCOPE_A, { autoDispose: false, autoClearState: false })

    getActivePiniaScopeTracker().addStore(SCOPE_A, storeA1)
    getActivePiniaScopeTracker().addStore(SCOPE_A, storeA2)

    getActivePiniaScopeTracker().mounted(SCOPE_A)
    getActivePiniaScopeTracker().mounted(SCOPE_A)
    getActivePiniaScopeTracker().unmounted(SCOPE_A)
    getActivePiniaScopeTracker().unmounted(SCOPE_A)

    expect(getActivePiniaScopeTracker().has(SCOPE_A)).toBe(true)

    expect(storeA1DisposeSpy).toHaveBeenCalledTimes(0)
    expect(storeA2DisposeSpy).toHaveBeenCalledTimes(0)

    getActivePiniaScopeTracker().disposeAndClearState(SCOPE_A)

    expect(storeA1DisposeSpy).toHaveBeenCalledOnce()
    expect(storeA2DisposeSpy).toHaveBeenCalledOnce()

    expect(pinia.state.value[storeA1.$id]).toBe(undefined)
    expect(pinia.state.value[storeA2.$id]).toBe(undefined)

  })

  it('does not dispose of stores until getActivePiniaScopeTracker().disposeAndClearState() is called when autoDispose = true and autoClearState = false', async () => {
    const storeA1 = makeStore('store-A1')
    const storeA2 = makeStore('store-A2')

    const storeA1DisposeSpy = vi.spyOn(storeA1, '$dispose')
    const storeA2DisposeSpy = vi.spyOn(storeA2, '$dispose')

    getActivePiniaScopeTracker().init(SCOPE_A, { autoDispose: true, autoClearState: false })

    getActivePiniaScopeTracker().addStore(SCOPE_A, storeA1)
    getActivePiniaScopeTracker().addStore(SCOPE_A, storeA2)

    getActivePiniaScopeTracker().mounted(SCOPE_A)
    getActivePiniaScopeTracker().mounted(SCOPE_A)
    getActivePiniaScopeTracker().unmounted(SCOPE_A)
    getActivePiniaScopeTracker().unmounted(SCOPE_A)

    expect(getActivePiniaScopeTracker().has(SCOPE_A)).toBe(false)

    expect(storeA1DisposeSpy).toHaveBeenCalledTimes(1)
    expect(storeA2DisposeSpy).toHaveBeenCalledTimes(1)

    expect(pinia?.state.value[storeA1.$id]).toBe(storeA1.$state)
    expect(pinia?.state.value[storeA2.$id]).toBe(storeA2.$state)
  })

  it('when unmounted prematurely', async () => {
    getActivePiniaScopeTracker().unmounted(SCOPE_A)
  })

  it('allows a scope to be initialized a second time with the same options', async () => {
    getActivePiniaScopeTracker().init(SCOPE_A, { autoDispose: true })
    getActivePiniaScopeTracker().init(SCOPE_A, { autoDispose: true })

    getActivePiniaScopeTracker().init(SCOPE_B)
    getActivePiniaScopeTracker().init(SCOPE_B, { autoDispose: true, autoClearState: true })

    getActivePiniaScopeTracker().init(SCOPE_C, { autoDispose: false, autoClearState: false })
    getActivePiniaScopeTracker().init(SCOPE_C, { autoDispose: false, autoClearState: false })
  })

  it('throws an error if a scope is initialized a second time with different autoDispose options', async () => {
    getActivePiniaScopeTracker().init(SCOPE_A, { autoDispose: true })

    expect(() => {
      getActivePiniaScopeTracker().init(SCOPE_A, { autoDispose: false })
    }).toThrowError(`Attempting to use an existing pinia scope "${SCOPE_A}" with different options:` +
      '\n' + `existing scope.autoDispose = true` +
      '\n' + `option.autoDispose = false`)
  })

  it('throws an error if a scope is initialized a second time with different autoClearState options', async () => {
    getActivePiniaScopeTracker().init(SCOPE_A, { autoClearState: true })

    expect(() => {
      getActivePiniaScopeTracker().init(SCOPE_A, { autoClearState: false })
    }).toThrowError(`Attempting to use an existing pinia scope "${SCOPE_A}" with different options:` +
      '\n' + `existing scope.autoClearState = true` +
      '\n' + `option.autoClearState = false`)
  })

  it('throws an error if a scope is initialized a second time with different options', async () => {
    getActivePiniaScopeTracker().init(SCOPE_A, { autoClearState: true, autoDispose: true })

    expect(() => {
      getActivePiniaScopeTracker().init(SCOPE_A, { autoClearState: false, autoDispose: false })
    }).toThrowError(`Attempting to use an existing pinia scope "${SCOPE_A}" with different options:` +
      '\n' + `existing scope.autoDispose = true` +
      '\n' + `option.autoDispose = false` +
      '\n' + `existing scope.autoClearState = true` +
      '\n' + `option.autoClearState = false`,
    )
  })
})
