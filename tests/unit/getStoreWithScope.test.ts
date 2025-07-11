import { describe, expect, it, vi } from 'vitest'
import { createPinia, defineStore, setActivePinia } from 'pinia'
import getStoreWithScope from '../../src/functions/getStoreWithScope'
import * as makeContext from '../../src/functions/makeContext'
import { ScopedContext } from '../../src'
import { mount } from '@vue/test-utils'
import { attachPiniaScope, getActivePiniaScopeTracker } from '../../src/pinia-scope'
import { NameStore } from '../helpers/test-stores'

const SCOPE_A = 'scope-a'
const storeId = 'test-store-id'
const StoreCreatorBase = ({ scopedId, lastStoreId }: ScopedContext) => {
  return defineStore(scopedId(storeId), () => {
    return {
      lastStoreId: lastStoreId(),
    }
  })
}
let noActivePiniaErrorMessage = '[🍍]: "getStoreWithScope()" was called but there was no active Pinia. Are you trying to use a store before calling "app.use(pinia)"?\n' +
  'See https://pinia.vuejs.org/core-concepts/outside-component-usage.html for help.\n' +
  'This will fail in production.'

describe('getStoreWithScope()', async () => {

  it('without attaching pinia-scope', async () => {

    const pinia = createPinia()

    setActivePinia(pinia)
    expect(() => {
      getStoreWithScope(NameStore, SCOPE_A)
    }).toThrowError('"getStoreWithScope()": pinia-scope has not been attached. Did you forget to call attachPiniaScope(pinia) ?')
  })

  describe('outside of component', async () => {
    it('with empty string scope', async () => {

      expect(() => {
        getStoreWithScope(StoreCreatorBase, '')
      }).toThrowError(noActivePiniaErrorMessage)
    })

    it('with scope', async () => {
      expect(() => {
        getStoreWithScope(StoreCreatorBase, SCOPE_A)
      }).toThrowError(noActivePiniaErrorMessage)
    })
  })

  describe('inside component', async () => {
    it('with scope', async () => {
      const pinia = createPinia()
      setActivePinia(pinia)
      attachPiniaScope(pinia)

      const context = makeContext.default(SCOPE_A)
      const ctxScopedIdSpy = vi.spyOn(context, 'scopedId')

      const tracker = getActivePiniaScopeTracker()
      const scopeInitSpy = vi.spyOn(tracker, 'init')
      const scopeMountedSpy = vi.spyOn(tracker, 'mounted')
      const scopeAddStoreSpy = vi.spyOn(tracker, 'addStore')
      const scopeUnmountedSpy = vi.spyOn(tracker, 'unmounted')

      const makeContextSpy = vi.spyOn(makeContext, 'default').mockReturnValue(context)
      const StoreCreator = vi.fn()
      StoreCreator.mockImplementation(StoreCreatorBase)

      const App = {
        setup() {
          const store = getStoreWithScope(StoreCreator, SCOPE_A)
          return {
            store,
          }
        },
        template: `
        `,
      }

      const wrapper = mount(App, {
        global: {
          plugins: [pinia],
        },
      })

      await wrapper.vm.$nextTick()

      expect(makeContextSpy).toHaveBeenCalledExactlyOnceWith(SCOPE_A)

      const ctx = makeContextSpy.mock.results[0].value

      const store = wrapper.vm.store as any
      expect(store.$id).toBe(SCOPE_A + '-' + storeId)
      expect(store.lastStoreId).toBe(storeId)

      expect(StoreCreator).toHaveBeenCalledExactlyOnceWith(ctx)
      expect(ctxScopedIdSpy).toHaveBeenCalledExactlyOnceWith(storeId)

      expect(scopeInitSpy).toHaveBeenCalledExactlyOnceWith(SCOPE_A, null)
      expect(scopeMountedSpy).toHaveBeenCalledExactlyOnceWith(SCOPE_A)
      expect(scopeAddStoreSpy).toHaveBeenCalledExactlyOnceWith(SCOPE_A, store)
      expect(scopeUnmountedSpy).toHaveBeenCalledTimes(0)

      wrapper.unmount()
      expect(scopeUnmountedSpy).toHaveBeenCalledExactlyOnceWith(SCOPE_A)
    })

    it('with empty string scope', async () => {
      const pinia = createPinia()
      setActivePinia(pinia)
      attachPiniaScope(pinia)

      const context = makeContext.default('')
      const ctxScopedIdSpy = vi.spyOn(context, 'scopedId')

      const tracker = getActivePiniaScopeTracker()
      const scopeInitSpy = vi.spyOn(tracker, 'init')
      const scopeMountedSpy = vi.spyOn(tracker, 'mounted')
      const scopeAddStoreSpy = vi.spyOn(tracker, 'addStore')
      const scopeUnmountedSpy = vi.spyOn(tracker, 'unmounted')

      const makeContextSpy = vi.spyOn(makeContext, 'default').mockReturnValue(context)
      const StoreCreator = vi.fn()
      StoreCreator.mockImplementation(StoreCreatorBase)

      const App = {
        setup() {
          const store = getStoreWithScope(StoreCreator, '')
          return {
            store,
          }
        },
        template: `
        `,
      }

      const wrapper = mount(App, {
        global: {
          plugins: [pinia],
        },
      })

      await wrapper.vm.$nextTick()

      expect(makeContextSpy).toHaveBeenCalledExactlyOnceWith('')

      const ctx = makeContextSpy.mock.results[0].value

      const store = wrapper.vm.store as any
      expect(store.$id).toBe(storeId)
      expect(store.lastStoreId).toBe(storeId)

      expect(StoreCreator).toHaveBeenCalledExactlyOnceWith(ctx)
      expect(ctxScopedIdSpy).toHaveBeenCalledExactlyOnceWith(storeId)

      expect(scopeInitSpy).toHaveBeenCalledTimes(0)
      expect(scopeMountedSpy).toHaveBeenCalledTimes(0)
      expect(scopeAddStoreSpy).toHaveBeenCalledTimes(0)
      expect(scopeUnmountedSpy).toHaveBeenCalledTimes(0)

      wrapper.unmount()
      expect(scopeUnmountedSpy).toHaveBeenCalledTimes(0)

    })

    it('without calling scopedId() lastStoreId error', async () => {
      const pinia = createPinia()
      setActivePinia(pinia)
      attachPiniaScope(pinia)

      const StoreCreator = ({}: ScopedContext) => {
        return defineStore('test-store', () => {
        })
      }

      expect(() => {
        getStoreWithScope(StoreCreator, SCOPE_A)
      }).toThrowError('Attempting to use a Pinia Scoped Store that did not call scopedId().')
    })
  })
})
