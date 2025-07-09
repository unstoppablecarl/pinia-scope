import { describe, expect, it, vi } from 'vitest'
import { createPinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { NameStore } from '../helpers/test-stores'
import useStoreWithoutScope from '../../src/functions/useStoreWithoutScope'
import * as getStoreWithScope from '../../src/functions/getStoreWithScope'
import setStoreScope from '../../src/functions/setStoreScope'
import { attachPiniaScope } from '../../src/pinia-scope'

const SCOPE_A = 'scope-a'

describe('useStoreWithoutScope()', async () => {

  it('outside of component', async () => {
    expect(
      () => useStoreWithoutScope(NameStore),
    ).toThrowError('useStoreWithoutScope() can only be used inside setup() or functional components.')
  })

  it('call internals correctly', async () => {

    const App = {
      setup() {
        setStoreScope(SCOPE_A)

        const store = useStoreWithoutScope(NameStore)
        return {
          store,
        }
      },
      template: `
      `,
    }

    const getStoreWithScopeSpy = vi.spyOn(getStoreWithScope, 'default')

    const pinia = createPinia()
    attachPiniaScope(pinia)

    const wrapper = mount(App, {
      global: {
        plugins: [pinia],
      },
      template: `a`
    })

    await wrapper.vm.$nextTick()

    expect(getStoreWithScopeSpy).toHaveBeenCalledWith(NameStore, '')
  })
})
