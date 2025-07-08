import { describe, expect, it, vi } from 'vitest'
import { createPinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { NameStore } from '../helpers/test-stores'
import * as getStoreScope from '../../src/functions/getStoreScope'
import useStore from '../../src/functions/useStore'
import * as getStoreWithScope from '../../src/functions/getStoreWithScope'

describe('useStore()', () => {

  it('outside of component', async () => {
    expect(
      () => useStore(NameStore),
    ).toThrowError('useStore() can only be used inside setup() or functional components.')
  })

  it('call internals correctly', async () => {

    const SCOPE_A = 'scope-a'
    const expectedReturnValue = Symbol('TESTING')

    const getStoreScopeSpy = vi.spyOn(getStoreScope, 'default').mockReturnValue(SCOPE_A)
    const getStoreWithScopeSpy = vi.spyOn(getStoreWithScope, 'default')
      .mockReturnValue(expectedReturnValue)

    const App = {
      setup() {
        const store = useStore(NameStore)
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

    expect(wrapper.vm.store).toBe(expectedReturnValue)
    expect(getStoreWithScopeSpy).toHaveBeenCalledExactlyOnceWith(NameStore, SCOPE_A)
    expect(getStoreScopeSpy).toHaveBeenCalledTimes(1)

  })
})
