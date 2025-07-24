import { describe, expect, it, vi } from 'vitest'
import { defineScopeableStore, getDefiningStoreDepth } from '../../src/functions/defineScopeableStore'
import { createPinia, type Pinia, setActivePinia } from 'pinia'
import { attachPiniaScope } from '../../src/pinia-scope'

describe('defineScopeableStore()', () => {
  it('throws error when no active pinia is available', async () => {
    const useTestStore = defineScopeableStore('foo', () => {
    })
    let message = '[🍍]: "defineScopeableStore()" was called but there was no active Pinia. Are you trying to use a store before calling "app.use(pinia)"?\nSee https://pinia.vuejs.org/core-concepts/outside-component-usage.html for help.\nThis will fail in production.'
    expect(() => {
      useTestStore.unScoped()
    }).toThrowError(message)

    expect(() => {
      useTestStore()
    }).toThrowError(message)
  })

  it('throws error when not attached', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)

    const useTestStore = defineScopeableStore('foo', () => {
    })
    expect(() => {
      useTestStore.unScoped()
    }).toThrowError('"defineScopeableStore()": pinia-scope has not been attached. Did you forget to call attachPiniaScope(pinia) ?')

    expect(() => {
      useTestStore()
    }).toThrowError('"defineScopeableStore()": pinia-scope has not been attached. Did you forget to call attachPiniaScope(pinia) ?')
  })

  it('warns and tracks depth when autoInjectScope = true', async () => {
    const warnSpy = vi.spyOn(console, 'warn')

    const pinia = createPinia()
    attachPiniaScope(pinia, {
      autoInjectScope: true,
    })
    setActivePinia(pinia)

    let store3Depth
    let store2Depth
    let store1Depth

    const useTestStore3 = defineScopeableStore('test-3', ({ scope }) => {
      store3Depth = getDefiningStoreDepth()
    })

    const useTestStore2 = defineScopeableStore('test-2', ({ scope }) => {
      useTestStore3()
      store2Depth = getDefiningStoreDepth()
    })

    const useTestStore = defineScopeableStore('test-1', ({ scope }) => {
      useTestStore2()
      store1Depth = getDefiningStoreDepth()
    })

    useTestStore()
    expect(store1Depth).toBe(1)
    expect(store2Depth).toBe(2)
    expect(store3Depth).toBe(3)

    expect(warnSpy).toHaveBeenNthCalledWith(1, `[Pinia Scope]: Attempting to auto-inject scope from a component via "useMyStore()" with store id: "test-2" inside of another store. You should do "useMyStore(scope)" or "useMyStore.unScoped()" instead.`)
    expect(warnSpy).toHaveBeenNthCalledWith(2, '[Pinia Scope]: Attempting to auto-inject scope from a component via "useMyStore()" with store id: "test-3" inside of another store. You should do "useMyStore(scope)" or "useMyStore.unScoped()" instead.')
    expect(warnSpy).toHaveBeenCalledTimes(2)
  })

  it('does not warn when not attached when autoInjectScope = false', async () => {
    const pinia = createPinia()
    attachPiniaScope(pinia, {
      autoInjectScope: false,
    })
    setActivePinia(pinia)
    testDoesNotWarnWhenOrTrackDepth(pinia)
  })

  it('does not warn when not attached when autoInjectScope = true and __DEV__ is false', async () => {
    vi.stubGlobal('__DEV__', false)
    const pinia = createPinia()
    attachPiniaScope(pinia, {
      autoInjectScope: true,
    })
    setActivePinia(pinia)
    testDoesNotWarnWhenOrTrackDepth(pinia)
    vi.unstubAllGlobals()
  })
})

function testDoesNotWarnWhenOrTrackDepth(pinia: Pinia) {
  const warnSpy = vi.spyOn(console, 'warn')

  let store3Depth
  let store2Depth
  let store1Depth

  const useTestStore3 = defineScopeableStore('test-3', ({ scope }) => {
    store3Depth = getDefiningStoreDepth()
  })

  const useTestStore2 = defineScopeableStore('test-2', ({ scope }) => {
    useTestStore3()
    store2Depth = getDefiningStoreDepth()
  })

  const useTestStore = defineScopeableStore('test-1', ({ scope }) => {
    useTestStore2()
    store1Depth = getDefiningStoreDepth()
  })

  useTestStore()
  expect(store1Depth).toBe(0)
  expect(store2Depth).toBe(0)
  expect(store3Depth).toBe(0)

  expect(warnSpy).toHaveBeenCalledTimes(0)
}