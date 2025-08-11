import { describe, expect, it } from 'vitest'
import { defineNonScopeableStore } from '../../src/functions/defineNonScopeableStore'
import { createPinia, type PiniaPluginContext, setActivePinia } from 'pinia'
import { attachPiniaScope } from '../../src/pinia-scope'
import { mount } from '@vue/test-utils'
import { defineScopeableStore, setComponentScope } from '../../src'

const TEST_STORE_ID = 'test-store'
const SCOPE_A = 'scope-a'
const TEST_STATE = {
  foo: 'bar',
}
const useTestStore = defineNonScopeableStore(TEST_STORE_ID, () => {
  return {
    testState: TEST_STATE,
  }
})

describe('defineNonScopeableStore()', () => {
  it('resolves outside of component', async () => {
    const pinia = createPinia()
    attachPiniaScope(pinia)
    setActivePinia(pinia)

    const useBasicStore = defineNonScopeableStore(TEST_STORE_ID, ({ unScoped }) => {
      return {
        unScoped,
        testState: TEST_STATE,
      }
    })

    const storeNoArg = useBasicStore()
    const store = useBasicStore(undefined)
    const storeString = useBasicStore('')
    const storeUnScoped = useBasicStore.unScoped()

    expect(store).toBe(storeNoArg)
    expect(store).toBe(storeUnScoped)
    expect(store).toBe(storeString)
    expect(store.testState).toEqual(TEST_STATE)
    expect(store.unScoped).toEqual('')
  })

  it('resolves outside of component with error when given scope', async () => {
    const pinia = createPinia()
    attachPiniaScope(pinia)
    setActivePinia(pinia)

    expect(() => {
      useTestStore(SCOPE_A)
    }).toThrowError(`Attempting to use un-scopeable store (store id: "${TEST_STORE_ID}") with scope "${SCOPE_A}".`)

    expect(() => {
      useTestStore.componentScoped()
    }).toThrowError(`getComponentScope() can only be used inside setup() or functional components.`)
  })

  it('resolves inside of component when no scope is set', async () => {
    const pinia = createPinia()
    attachPiniaScope(pinia)
    setActivePinia(pinia)
    const App = {
      setup() {
        const store = useTestStore()
        return {
          store,
        }
      },
      template: `A`,
    }

    const wrapper = mount(App, {
      global: {
        plugins: [pinia],
      },
    })

    const store = wrapper.vm.store as ReturnType<typeof useTestStore>
    expect(store.testState).toEqual(TEST_STATE)
  })

  it('throws an error inside of component when scope is set', async () => {
    const pinia = createPinia()
    attachPiniaScope(pinia)
    setActivePinia(pinia)


    const App = {
      setup() {
        setComponentScope(SCOPE_A)
        useTestStore()
      },
      template: `A`,
    }
    expect(() => {

      const wrapper = mount(App, {
        global: {
          plugins: [pinia],
        },
      })

    }).toThrowError(`Attempting to use un-scopeable store (store id: "${TEST_STORE_ID}") with scope "${SCOPE_A}".`)
  })

  it('handles plugin options', async () => {
    let count = 0
    const options = {
      foo: {
        some: 'thing',
      },
    }

    function testPiniaPlugin(context: PiniaPluginContext) {
      count++
      expect(context.options).toEqual({
        actions: {},
        ...options,
      })
    }

    const pinia = createPinia()
    attachPiniaScope(pinia, {
      autoInjectScope: true,
    })
    pinia.use(testPiniaPlugin)
    setActivePinia(pinia)
    mount({ template: 'none' }, { global: { plugins: [pinia] } })

    const useTestStore = defineNonScopeableStore('test', () => {
      return {
        a: 'b',
      }
      // @ts-expect-error
    }, options)

    const store = useTestStore()
    expect(count).toBe(1)
  })
})