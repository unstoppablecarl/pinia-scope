import { beforeEach, describe, expect, it } from 'vitest'
import { injectorKey, instanceKey } from '../../src/constants'
import { getComponentScope } from '../../src/functions/getComponentScope'
import { createPinia, Pinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { getCurrentInstance, provide } from 'vue'
import { attachPiniaScope, clearPiniaScope, getActivePiniaScopeTracker } from '../../src/pinia-scope'

const SCOPE_A = 'scope-a'
const SCOPE_B = 'scope-b'

describe('getComponentScope()', () => {

  let pinia: Pinia

  beforeEach(() => {
    pinia = createPinia()
    clearPiniaScope(pinia)
    attachPiniaScope(pinia)
  })

  it('outside of component', async () => {
    expect(
      () => getComponentScope(),
    ).toThrowError('getComponentScope() can only be used inside setup() or functional components.')
  })

  it('can get default scope', async () => {
    const App = {
      setup() {

        const instance = getCurrentInstance() as any
        instance[instanceKey] = ''

        const scope = getComponentScope()

        return {
          scope,
        }
      },
      template: `a`,
    }

    const wrapper = mount(App, {
      global: {
        plugins: [pinia],
      },
    })

    await wrapper.vm.$nextTick()
    expect(wrapper.vm.scope).toBe('')
    expect(getActivePiniaScopeTracker().keys()).toEqual([])
  })

  it('can get self set scope', async () => {
    const App = {
      setup() {

        const instance = getCurrentInstance() as any
        instance[instanceKey] = SCOPE_A

        const scope = getComponentScope()

        return {
          scope,
        }
      },
      template: `a`,
    }

    const wrapper = mount(App, {
      global: {
        plugins: [pinia],
      },
    })

    await wrapper.vm.$nextTick()
    expect(wrapper.vm.scope).toBe(SCOPE_A)
    expect(getActivePiniaScopeTracker().keys()).toEqual([])
  })

  it('can get parent injected scope', async () => {

    const Child = {
      setup() {
        const scope = getComponentScope()
        return {
          scope,
        }
      },
      template: `
      `,
    }

    const App = {
      components: {
        Child,
      },
      setup() {
        provide(injectorKey, SCOPE_A)
      },
      template: `
				<Child ref="child" />`,
    }

    const wrapper = mount(App, {
      global: {
        plugins: [pinia],
      },
    })

    await wrapper.vm.$nextTick()

    const child = wrapper.findComponent({ ref: 'child' })

    expect(child.vm.scope).toBe(SCOPE_A)

    expect(getActivePiniaScopeTracker().keys()).toEqual([])
  })


  it('can get self injected scope instead of parent injected scope', async () => {
    const Child = {
      setup() {
        const instance = getCurrentInstance() as any
        instance[instanceKey] = SCOPE_B

        const scope = getComponentScope()
        return {
          scope,
        }
      },
      template: `
      `,
    }

    const App = {
      components: {
        Child,
      },
      setup() {
        provide(injectorKey, SCOPE_A)
      },
      template: `
				<Child ref="child" />`,
    }

    const wrapper = mount(App, {
      global: {
        plugins: [pinia],
      },
    })

    await wrapper.vm.$nextTick()

    const child = wrapper.findComponent({ ref: 'child' })

    expect(child.vm.scope).toBe(SCOPE_B)
    expect(getActivePiniaScopeTracker().keys()).toEqual([])
  })
})
