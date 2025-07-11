import { describe, expect, it, vi } from 'vitest'
import { createPinia, defineStore, setActivePinia } from 'pinia'
import getStoreWithScope from '../../src/functions/getStoreWithScope'
import * as makeContext from '../../src/functions/makeContext'
import * as createScopeNameFactory from '../../src/functions/createScopeNameFactory'
import * as global from '../../src/pinia-scope'
import { attachPiniaScope, getActivePiniaScopeTracker, getActiveTracker } from '../../src/pinia-scope'

import { ScopedContext } from '../../src'
import { mount } from '@vue/test-utils'
import { NameStore } from '../helpers/test-stores'
import { StoreCreator } from '../../types'

const SCOPE_A = 'scope-a'
const STORE_ID = 'test-store-id'
const StoreCreatorBase = ({ addScope }: ScopedContext) => {
  return defineStore(addScope(STORE_ID), () => {
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

  it('outside of component with empty string scope', async () => {
    expect(() => {
      getStoreWithScope(StoreCreatorBase, '')
    }).toThrowError(noActivePiniaErrorMessage)
  })

  it('outside of component with scope', async () => {
    expect(() => {
      getStoreWithScope(StoreCreatorBase, SCOPE_A)
    }).toThrowError(noActivePiniaErrorMessage)
  })

  it('inside component with scope', async () => {
    const getActiveTrackerSpy = vi.spyOn(global, 'getActiveTracker')
    const scopeNameFactory = createScopeNameFactory.default()

    const pinia = createPinia()
    setActivePinia(pinia)
    attachPiniaScope(pinia)
    const tracker = getActivePiniaScopeTracker()

    const context = makeContext.default(SCOPE_A, scopeNameFactory.generate)
    const ctxGetBaseStoreIdSpy = vi.spyOn(context, 'getBaseStoreId')

    const trackerInitSpy = vi.spyOn(tracker, 'init')
    const trackerMountedSpy = vi.spyOn(tracker, 'mounted')
    const trackerAddStoreSpy = vi.spyOn(tracker, 'addStore')
    const trackerUnmountedSpy = vi.spyOn(tracker, 'unmounted')
    const trackerMakeContextSpy = vi.spyOn(tracker, 'makeContext').mockReturnValue(context)

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

    expect(getActiveTrackerSpy).toHaveBeenCalledExactlyOnceWith('getStoreWithScope')
    expect(trackerMakeContextSpy).toHaveBeenCalledExactlyOnceWith(SCOPE_A)
    expect(StoreCreator).toHaveBeenCalledExactlyOnceWith(context)
    expect(ctxGetBaseStoreIdSpy).toHaveBeenCalledExactlyOnceWith()

    const store = wrapper.vm.store as any

    expect(trackerInitSpy).toHaveBeenCalledExactlyOnceWith(SCOPE_A, null)
    expect(trackerMountedSpy).toHaveBeenCalledExactlyOnceWith(SCOPE_A)
    expect(trackerAddStoreSpy).toHaveBeenCalledExactlyOnceWith(SCOPE_A, store)
    expect(trackerUnmountedSpy).toHaveBeenCalledTimes(0)

    wrapper.unmount()
    expect(trackerUnmountedSpy).toHaveBeenCalledExactlyOnceWith(SCOPE_A)
  })

  it('inside component with empty string scope', async () => {
    const getActiveTrackerSpy = vi.spyOn(global, 'getActiveTracker')
    const scopeNameFactory = createScopeNameFactory.default()

    const pinia = createPinia()
    setActivePinia(pinia)
    attachPiniaScope(pinia)
    const tracker = getActivePiniaScopeTracker()

    const context = makeContext.default('', scopeNameFactory.generate)
    const ctxGetBaseStoreIdSpy = vi.spyOn(context, 'getBaseStoreId')

    const trackerInitSpy = vi.spyOn(tracker, 'init')
    const trackerMountedSpy = vi.spyOn(tracker, 'mounted')
    const trackerAddStoreSpy = vi.spyOn(tracker, 'addStore')
    const trackerUnmountedSpy = vi.spyOn(tracker, 'unmounted')
    const trackerMakeContextSpy = vi.spyOn(tracker, 'makeContext').mockReturnValue(context)

    const store = {foo: 'bar'}
    const useStore = vi.fn(() => store)

    const StoreCreatorMock = vi.fn(({ addScope }: ScopedContext) => {
      addScope('test-store')
      return useStore
    }) as unknown as StoreCreator

    const App = {
      setup() {
        const store = getStoreWithScope(StoreCreatorMock, '')
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

    expect(getActiveTrackerSpy).toHaveBeenCalledExactlyOnceWith('getStoreWithScope')

    expect(trackerMakeContextSpy).toHaveBeenCalledExactlyOnceWith('')
    expect(StoreCreatorMock).toHaveBeenCalledExactlyOnceWith(context)
    expect(ctxGetBaseStoreIdSpy).toHaveBeenCalledExactlyOnceWith()

    expect(wrapper.vm.store).toBe(store)
    expect(useStore).toHaveBeenCalledTimes(1)
    expect(trackerInitSpy).toHaveBeenCalledTimes(0)
    expect(trackerMountedSpy).toHaveBeenCalledTimes(0)
    expect(trackerAddStoreSpy).toHaveBeenCalledTimes(0)
    expect(trackerUnmountedSpy).toHaveBeenCalledTimes(0)

    wrapper.unmount()
    expect(trackerUnmountedSpy).toHaveBeenCalledTimes(0)
  })

  it('inside component without calling context.addScope() error', async () => {
    const getActiveTrackerSpy = vi.spyOn(global, 'getActiveTracker')
    const scopeNameFactory = createScopeNameFactory.default()

    const pinia = createPinia()
    setActivePinia(pinia)
    attachPiniaScope(pinia)
    const tracker = getActivePiniaScopeTracker()

    const context = makeContext.default('', scopeNameFactory.generate)
    const ctxGetBaseStoreIdSpy = vi.spyOn(context, 'getBaseStoreId')

    const trackerInitSpy = vi.spyOn(tracker, 'init')
    const trackerMountedSpy = vi.spyOn(tracker, 'mounted')
    const trackerAddStoreSpy = vi.spyOn(tracker, 'addStore')
    const trackerUnmountedSpy = vi.spyOn(tracker, 'unmounted')
    const trackerMakeContextSpy = vi.spyOn(tracker, 'makeContext').mockReturnValue(context)

    const store = {foo: 'bar'}
    const useStore = vi.fn(() => store)

    const StoreCreatorMock = vi.fn(({ addScope }: ScopedContext) => {
      return useStore
    }) as unknown as StoreCreator

    const App = {
      setup() {
        const store = getStoreWithScope(StoreCreatorMock, '')
        return {
          store,
        }
      },
      template: `
      `,
    }


    expect(() => {
      const wrapper = mount(App, {
        global: {
          plugins: [pinia],
        },
      })

    }).toThrowError('Attempting to use a Pinia Scoped Store that did not call addScope().')


    expect(getActiveTrackerSpy).toHaveBeenCalledExactlyOnceWith('getStoreWithScope')

    expect(trackerMakeContextSpy).toHaveBeenCalledExactlyOnceWith('')
    expect(StoreCreatorMock).toHaveBeenCalledExactlyOnceWith(context)
    expect(ctxGetBaseStoreIdSpy).toHaveBeenCalledExactlyOnceWith()

    expect(useStore).toHaveBeenCalledTimes(0)
    expect(trackerInitSpy).toHaveBeenCalledTimes(0)
    expect(trackerMountedSpy).toHaveBeenCalledTimes(0)
    expect(trackerAddStoreSpy).toHaveBeenCalledTimes(0)
    expect(trackerUnmountedSpy).toHaveBeenCalledTimes(0)
    expect(trackerUnmountedSpy).toHaveBeenCalledTimes(0)
  })
})
