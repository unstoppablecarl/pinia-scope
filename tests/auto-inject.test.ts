import { describe, expect, it, vi } from 'vitest'
import { NameStore_ID, useNameStore } from './helpers/test-stores'
import { createPinia, type Pinia, setActivePinia, type Store } from 'pinia'
import { attachPiniaScope, defineScopeableStore, setComponentScope } from '../src'
import { mount } from '@vue/test-utils'

const SCOPE_A = 'scope-a'

describe('autoInjectScope = true', async () => {
  it('inside component without injection', async () => {
    const pinia = createPinia()
    attachPiniaScope(pinia)

    testInsideComponentWithoutInjection(pinia)
  })

  it('inside component with setComponentScope()', async () => {
    const pinia = createPinia()
    attachPiniaScope(pinia)

    const storeId = insideComponentWithSetStoreScope(pinia)

    expect(storeId).toBe(SCOPE_A + '-' + NameStore_ID)
  })

  it('inside component with parent injected scope', async () => {
    const pinia = createPinia()
    attachPiniaScope(pinia)

    const warnSpy = vi.spyOn(console, 'warn')

    const Child = {
      setup() {
        const nameStore = useNameStore()
        const nameStoreInjected = useNameStore.componentScope()

        return {
          nameStore,
          nameStoreInjected,
        }
      },
      template: `S`,
    }

    const App = {
      components: {
        Child,
      },
      setup() {
        setComponentScope(SCOPE_A)
      },
      template: `
				<Child ref="child" />`,
    }

    const wrapper = mount(App, {
      global: {
        plugins: [pinia],
      },
    })

    const child = wrapper.findComponent({ ref: 'child' })
    const nameStore1 = child.vm.nameStore as Store
    const nameStore1Injected = child.vm.nameStoreInjected as Store

    expect(nameStore1.$id).toBe(SCOPE_A + '-' + NameStore_ID)
    expect(nameStore1Injected.$id).toBe(SCOPE_A + '-' + NameStore_ID)
    expect(warnSpy).toHaveBeenCalledTimes(0)

  })

  it('outside component uses unscoped when not injected', async () => {
    const pinia = createPinia()
    attachPiniaScope(pinia)
    setActivePinia(pinia)

    const warnSpy = vi.spyOn(console, 'warn')
    const nameStore = useNameStore()
    expect(nameStore.$id).toBe(NameStore_ID)
    expect(warnSpy).toHaveBeenCalledTimes(0)
  })

  it('auto injecting scope inside of a store should warn in DEV', async () => {
    vi.stubGlobal('__DEV__', true)
    const pinia = createPinia()
    attachPiniaScope(pinia)
    setActivePinia(pinia)

    const useTest2Store = defineScopeableStore('test-2-store', () => {
    })

    const useTest1Store = defineScopeableStore('test-1-store', () => {
      useTest2Store()
    })

    const warnSpy = vi.spyOn(console, 'warn')
    useTest1Store()

    expect(warnSpy).toHaveBeenCalledExactlyOnceWith('[Pinia Scope]: Attempting to auto-inject scope from a component via "useMyStore()" with store id: "test-2-store" inside of another store. You should do "useMyStore(scope)" or "useMyStore.unScoped()" instead.')
    vi.unstubAllGlobals()
  })

  it('auto injecting scope inside of a store should not warn outside DEV ', async () => {
    vi.stubGlobal('__DEV__', false)
    const pinia = createPinia()
    attachPiniaScope(pinia)
    setActivePinia(pinia)

    const useTest2Store = defineScopeableStore('test-2-store', () => {
    })

    const useTest1Store = defineScopeableStore('test-1-store', () => {
      useTest2Store()
    })

    const warnSpy = vi.spyOn(console, 'warn')
    useTest1Store()

    expect(warnSpy).toHaveBeenCalledTimes(0)
    vi.unstubAllGlobals()
  })
})

describe('autoInjectScope = false', async () => {

  it('inside component without injection', async () => {
    const pinia = createPinia()
    attachPiniaScope(pinia, { autoInjectScope: false })
    testInsideComponentWithoutInjection(pinia)
  })

  it('inside component with setComponentScope()', async () => {
    const pinia = createPinia()
    attachPiniaScope(pinia, { autoInjectScope: false })

    const storeId = insideComponentWithSetStoreScope(pinia)
    expect(storeId).toBe(NameStore_ID)
  })

  it('outside component uses unscoped', async () => {
    outsideComponentUsesUnscoped()
  })

  it('outside component uses unscoped when __DEV__ = false', async () => {
    vi.stubGlobal('__DEV__', false)
    outsideComponentUsesUnscoped()
    vi.unstubAllGlobals()
  })
})


function testInsideComponentWithoutInjection(pinia: Pinia) {
  const App = {
    setup() {
      const nameStore = useNameStore()
      return {
        nameStore,
      }
    },
    template: `S`,
  }

  const wrapper = mount(App, {
    global: {
      plugins: [pinia],
    },
  })

  let nameStore1 = wrapper.vm.nameStore as Store
  expect(nameStore1.$id).toBe(NameStore_ID)
}

function insideComponentWithSetStoreScope(pinia: Pinia) {
  const App = {
    setup() {
      setComponentScope(SCOPE_A)
      const nameStore = useNameStore()
      return {
        nameStore,
      }
    },
    template: `S`,
  }

  const warnSpy = vi.spyOn(console, 'warn')

  const wrapper = mount(App, {
    global: {
      plugins: [pinia],
    },
  })

  let nameStore1 = wrapper.vm.nameStore as Store
  expect(warnSpy).toHaveBeenCalledTimes(0)

  return nameStore1.$id
}

function outsideComponentUsesUnscoped() {
  const pinia = createPinia()
  attachPiniaScope(pinia, {
    autoInjectScope: false,
  })
  setActivePinia(pinia)
  const warnSpy = vi.spyOn(console, 'warn')

  const nameStore = useNameStore()
  expect(nameStore.$id).toBe(NameStore_ID)
  expect(warnSpy).toHaveBeenCalledTimes(0)
}