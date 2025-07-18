import { describe, expect, it, vi } from 'vitest'
import { NameStore_ID, useNameStore } from './helpers/test-stores'
import { createPinia, setActivePinia, type Store } from 'pinia'
import { attachPiniaScope, defineScopeableStore, setStoreScope } from '../src'
import { mount } from '@vue/test-utils'
import { type ScopedContext } from '../src/functions/defineScopeableStore'

const SCOPE_A = 'scope-a'

describe('autoInjectScope = true', async () => {
  it('inside component without injection', async () => {
    const pinia = createPinia()
    attachPiniaScope(pinia)

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
  })

  it('inside component with setStoreScope()', async () => {
    const pinia = createPinia()
    attachPiniaScope(pinia)

    const App = {
      setup() {
        setStoreScope(SCOPE_A)
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
    expect(nameStore1.$id).toBe(SCOPE_A + '-' + NameStore_ID)
  })

  it('inside component with parent injected scope', async () => {
    const pinia = createPinia()
    attachPiniaScope(pinia)

    const Child = {
      setup() {
        const nameStore = useNameStore()
        const nameStoreInjected = useNameStore.injectedScope()

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
        setStoreScope(SCOPE_A)
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
  })

  it('outside component uses unscoped when not injected', async () => {
    const pinia = createPinia()
    attachPiniaScope(pinia)
    setActivePinia(pinia)

    const nameStore = useNameStore()
    expect(nameStore.$id).toBe(NameStore_ID)
  })

  it('auto injecting scope inside of a store should warn in DEV', async () => {
    vi.stubGlobal('__DEV__', true)
    const pinia = createPinia()
    attachPiniaScope(pinia)
    setActivePinia(pinia)

    const useTest2Store = defineScopeableStore('test-2-store', ({ scope }: ScopedContext) => {
    })

    const useTest1Store = defineScopeableStore('test-1-store', ({ scope }: ScopedContext) => {
      useTest2Store()
    })

    const warnSpy = vi.spyOn(console, 'warn')
    useTest1Store()

    expect(warnSpy).toHaveBeenCalledExactlyOnceWith('[Pinia Scope]: Attempting to auto-inject scope from a component via "useMyStore()" inside of another store. You should do "useMyStore(scope)" or "useMyStore.unScoped()" instead.')
    vi.unstubAllGlobals()
  })

  it('auto injecting scope inside of a store should not warn outside DEV ', async () => {
    vi.stubGlobal('__DEV__', false)
    const pinia = createPinia()
    attachPiniaScope(pinia)
    setActivePinia(pinia)

    const useTest2Store = defineScopeableStore('test-2-store', ({ scope }: ScopedContext) => {
    })

    const useTest1Store = defineScopeableStore('test-1-store', ({ scope }: ScopedContext) => {
      useTest2Store()
    })

    const warnSpy = vi.spyOn(console, 'warn')
    useTest1Store()

    expect(warnSpy).toHaveBeenCalledTimes(0)
    vi.unstubAllGlobals()
  })
})

describe('autoInjectScope = false', async () => {
  it('outside component uses unscoped', async () => {
    const pinia = createPinia()
    attachPiniaScope(pinia, {
      autoInjectScope: false,
    })
    setActivePinia(pinia)

    const nameStore = useNameStore()
    expect(nameStore.$id).toBe(NameStore_ID)
  })
})