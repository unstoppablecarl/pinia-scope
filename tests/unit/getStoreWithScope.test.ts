import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, defineStore, setActivePinia } from 'pinia'
import getStoreWithScope from '../../src/functions/getStoreWithScope'
import { NameStore } from '../helpers/test-stores'
import * as makeContext from '../../src/functions/makeContext'
import { ScopedContext } from '../../src/functions/makeContext'
import { mount } from '@vue/test-utils'
import { CreatedStore, StoreCreator } from '../../src/types'
import { attachPiniaScope, clearPiniaScope, getActivePiniaScopeTracker } from '../../src/pinia-scope'

const SCOPE_A = 'scope-a'

describe('getStoreWithScope()', () => {
  const pinia = createPinia()

  beforeEach(() => {
    clearPiniaScope(pinia)
    attachPiniaScope(pinia)
    setActivePinia(pinia)
  })

  const mockedStoreFactory = <S extends StoreCreator>(storeCreator: S): CreatedStore<S> => {
    return defineStore('foo', () => {
      return {}
    }) as CreatedStore<S>
  }

  it('outside of component', async () => {

    const storeId = 'test-store-id'

    const context: ScopedContext = {
      scopedId: (id: string) => 'foo',
      lastStoreId: () => storeId,
      clearLastStoreId: () => {
      },
      useStore: mockedStoreFactory,
      useStoreWithoutScope: mockedStoreFactory,
    }

    const scopeInitSpy = vi.spyOn(getActivePiniaScopeTracker(), 'init')
    const scopeMountedSpy = vi.spyOn(getActivePiniaScopeTracker(), 'mounted')
    const scopeAddStoreSpy = vi.spyOn(getActivePiniaScopeTracker(), 'addStore')
    const scopeUnmountedSpy = vi.spyOn(getActivePiniaScopeTracker(), 'unmounted')

    const ctxScopedIdSpy = vi.spyOn(context, 'scopedId')
    const ctxClearLastStoreIdSpy = vi.spyOn(context, 'clearLastStoreId')
    const storeCreator = vi.fn().mockImplementation(NameStore)
    const makeContextSpy = vi.spyOn(makeContext, 'default').mockReturnValue(context)

    const result = getStoreWithScope(storeCreator, SCOPE_A)

    expect(result.__PINIA_SCOPE__).toBe(SCOPE_A)
    expect(result.__PINIA_SCOPE_ID__).toBe(storeId)
    expect(makeContextSpy).toHaveBeenCalledExactlyOnceWith(SCOPE_A)

    const ctx = makeContextSpy.mock.results[0].value
    const store = storeCreator.mock.results[0].value

    expect(storeCreator).toHaveBeenCalledWith(ctx)
    expect(ctxScopedIdSpy).toHaveBeenCalledOnce()
    expect(ctxClearLastStoreIdSpy).toHaveBeenCalledOnce()

    expect(scopeInitSpy).toHaveBeenCalledExactlyOnceWith(SCOPE_A, null)
    expect(scopeMountedSpy).toHaveBeenCalledTimes(0)
    expect(scopeAddStoreSpy).toHaveBeenCalledExactlyOnceWith(SCOPE_A, store())
    expect(scopeUnmountedSpy).toHaveBeenCalledTimes(0)

  })

  it('inside of component', async () => {

    const storeId = 'test-store-id'

    const context = {
      scopedId: (id: string) => 'foo',
      lastStoreId: () => storeId,
      clearLastStoreId: () => {
      },
      useStore: mockedStoreFactory,
      useStoreWithoutScope: mockedStoreFactory,
    }

    const scopeInitSpy = vi.spyOn(getActivePiniaScopeTracker(), 'init')
    const scopeMountedSpy = vi.spyOn(getActivePiniaScopeTracker(), 'mounted')
    const scopeAddStoreSpy = vi.spyOn(getActivePiniaScopeTracker(), 'addStore')
    const scopeUnmountedSpy = vi.spyOn(getActivePiniaScopeTracker(), 'unmounted')

    const ctxScopedIdSpy = vi.spyOn(context, 'scopedId')
    const ctxClearLastStoreIdSpy = vi.spyOn(context, 'clearLastStoreId')
    const storeCreator = vi.fn().mockImplementation(NameStore)
    const makeContextSpy = vi.spyOn(makeContext, 'default').mockReturnValue(context)

    const App = {
      setup() {
        const store = getStoreWithScope(storeCreator, SCOPE_A)
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
    const store = storeCreator.mock.results[0].value

    const vmStore = wrapper.vm.store as any
    expect(vmStore.__PINIA_SCOPE__).toBe(SCOPE_A)
    expect(vmStore.__PINIA_SCOPE_ID__).toBe(storeId)

    expect(storeCreator).toHaveBeenCalledWith(ctx)
    expect(ctxScopedIdSpy).toHaveBeenCalledOnce()
    expect(ctxClearLastStoreIdSpy).toHaveBeenCalledOnce()

    expect(scopeInitSpy).toHaveBeenCalledExactlyOnceWith(SCOPE_A, null)
    expect(scopeMountedSpy).toHaveBeenCalledExactlyOnceWith(SCOPE_A)
    expect(scopeAddStoreSpy).toHaveBeenCalledExactlyOnceWith(SCOPE_A, store())
    expect(scopeUnmountedSpy).toHaveBeenCalledTimes(0)

    wrapper.unmount()
    expect(scopeUnmountedSpy).toHaveBeenCalledExactlyOnceWith(SCOPE_A)

  })


  it('inside of component with empty string scope', async () => {

    const storeId = 'test-store-id'

    const context = {
      scopedId: (id: string) => 'foo',
      lastStoreId: () => storeId,
      clearLastStoreId: () => {
      },
      useStore: mockedStoreFactory,
      useStoreWithoutScope: mockedStoreFactory,
    }

    const scopeInitSpy = vi.spyOn(getActivePiniaScopeTracker(), 'init')
    const scopeMountedSpy = vi.spyOn(getActivePiniaScopeTracker(), 'mounted')
    const scopeAddStoreSpy = vi.spyOn(getActivePiniaScopeTracker(), 'addStore')
    const scopeUnmountedSpy = vi.spyOn(getActivePiniaScopeTracker(), 'unmounted')

    const ctxScopedIdSpy = vi.spyOn(context, 'scopedId')
    const ctxClearLastStoreIdSpy = vi.spyOn(context, 'clearLastStoreId')
    const storeCreator = vi.fn().mockImplementation(NameStore)
    const makeContextSpy = vi.spyOn(makeContext, 'default').mockReturnValue(context)

    const App = {
      setup() {
        const store = getStoreWithScope(storeCreator, '')
        return {
          store,
        }
      },
      template: `
      `,
    }

    const pinia = createPinia()
    const wrapper = mount(App, {
      global: {
        plugins: [pinia],
      },
    })

    await wrapper.vm.$nextTick()

    expect(makeContextSpy).toHaveBeenCalledExactlyOnceWith('')

    const ctx = makeContextSpy.mock.results[0].value

    const store = wrapper.vm.store as any
    expect(store.__PINIA_SCOPE__).toBe('')
    expect(store.__PINIA_SCOPE_ID__).toBe(storeId)

    expect(storeCreator).toHaveBeenCalledWith(ctx)
    expect(ctxScopedIdSpy).toHaveBeenCalledOnce()
    expect(ctxClearLastStoreIdSpy).toHaveBeenCalledOnce()

    expect(scopeInitSpy).toHaveBeenCalledTimes(0)
    expect(scopeMountedSpy).toHaveBeenCalledTimes(0)
    expect(scopeAddStoreSpy).toHaveBeenCalledTimes(0)
    expect(scopeUnmountedSpy).toHaveBeenCalledTimes(0)

    wrapper.unmount()
    expect(scopeUnmountedSpy).toHaveBeenCalledTimes(0)

  })

  it('outside of component with lastStoreId error', async () => {
    const context = {
      scopedId: (id: string) => 'foo',
      lastStoreId: () => null,
      clearLastStoreId: () => {
      },
      useStore: mockedStoreFactory,
      useStoreWithoutScope: mockedStoreFactory,
    }

    const storeCreator = vi.fn().mockImplementation(NameStore)
    vi.spyOn(makeContext, 'default').mockReturnValue(context)

    expect(() => {
      getStoreWithScope(storeCreator, SCOPE_A)
    }).toThrowError('Attempting to use a Pinia Scoped Store that did not call scopedId().')
  })
})
