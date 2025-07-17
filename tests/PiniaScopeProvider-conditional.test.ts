import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, Pinia, storeToRefs } from 'pinia'
import { getInjectedScope, StoreScopeProvider } from '../src'
import { attachPiniaScope, clearPiniaScope } from '../src/pinia-scope'
import { useNameStore } from './helpers/test-stores'

const SCOPE_A = 'scope-a'
const SCOPE_B = 'scope-b'

describe('Scope Switching', () => {

  let pinia: Pinia

  beforeEach(() => {
    pinia = createPinia()
    clearPiniaScope(pinia)
    attachPiniaScope(pinia)
  })

  it('can switch scope via conditional', async () => {
    const CompChild = {
      setup: function() {
        const scope = getInjectedScope()
        const nameStore = useNameStore.injectedScope()

        const { name } = storeToRefs(nameStore)

        return {
          scope,
          nameStore,
          name,
        }
      },
      template: `
				Child:[{{scope}}][{{name}}]
      `,
    }

    const App = {
      name: 'App',
      components: {
        CompChild,
        StoreScopeProvider,
      },
      props: {
        scope: String,
      },
      template: `
				<StoreScopeProvider v-if="scope === 'A'" scope="${SCOPE_A}">
					<CompChild ref="compA" />
				</StoreScopeProvider>
				<StoreScopeProvider v-if="scope === 'B'" scope="${SCOPE_B}">
					<CompChild ref="compB" />
				</StoreScopeProvider>
      `,
    }

    const wrapper = mount(App, {
      props: {
        scope: 'A',
      },
      global: {
        plugins: [pinia],
      },
    })

    const nameA = 'Amber'
    const nameB = 'Joe'

    const storeA = useNameStore(SCOPE_A)
    storeA.setName(nameA)

    const storeB = useNameStore(SCOPE_B)
    storeB.setName(nameB)

    await wrapper.vm.$nextTick()

    expect(wrapper.html()).toContain(`Child:[${SCOPE_A}][${nameA}]`)
    const compA = wrapper.findComponent({ ref: 'compA' })
    expect(compA.vm.name).toBe(nameA)
    expect(compA.vm.scope).toBe(SCOPE_A)

    await wrapper.setProps({
      scope: 'B',
    })

    expect(wrapper.html()).toContain(`Child:[${SCOPE_B}][${nameB}]`)
    const compB = wrapper.findComponent({ ref: 'compB' })
    expect(compB.vm.name).toBe(nameB)
    expect(compB.vm.scope).toBe(SCOPE_B)

  })
})
