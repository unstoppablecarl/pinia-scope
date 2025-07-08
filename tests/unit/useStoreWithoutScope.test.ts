import { describe, expect, it, vi } from 'vitest'
import { createPinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { NameStore } from '../helpers/test-stores'
import useStoreWithoutScope from '../../src/functions/useStoreWithoutScope'
import * as getStoreWithScope from '../../src/functions/getStoreWithScope'
import setStoreScope from '../../src/functions/setStoreScope'

const spy = vi.spyOn(getStoreWithScope, 'default')

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

    const pinia = createPinia()

    const wrapper = mount(App, {
      global: {
        plugins: [pinia],
      },
    })

    await wrapper.vm.$nextTick()

    expect(spy).toHaveBeenCalledWith(NameStore, '')
  })
})
