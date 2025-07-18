import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, type Pinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { attachPiniaScope, clearPiniaScope } from '../../src/pinia-scope'
import PiniaScopeProvider from '../../src/components/PiniaScopeProvider'
import * as setStoreScope from '../../src/functions/setStoreScope'

const SCOPE_A = 'scope-a'

describe('PiniaScopeProvider', () => {

  let pinia: Pinia

  beforeEach(() => {
    pinia = createPinia()
    clearPiniaScope(pinia)
    attachPiniaScope(pinia)
  })

  it('can get self set scope', async () => {

    const App = {
      components: {
        PiniaScopeProvider,
      },
      template: `
				<PiniaScopeProvider
					ref="scopeProvider"
					scope="${SCOPE_A}"
					:auto-dispose="false"
					:auto-clear-state="false">
					<div>SOMETHING</div>
				</PiniaScopeProvider>`,
    }

    const setStoreScopeSpy = vi.spyOn(setStoreScope, 'setStoreScope')

    const wrapper = mount(App, {
      global: {
        plugins: [pinia],
      },
    })

    expect(wrapper.html()).toContain('<div>SOMETHING</div>')
    expect(setStoreScopeSpy).toHaveBeenCalledExactlyOnceWith(SCOPE_A, {
      autoDispose: false,
      autoClearState: false,
    })
  })
})
