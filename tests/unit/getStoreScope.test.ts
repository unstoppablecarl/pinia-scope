import { describe, expect, it } from 'vitest'
import { injectorKey } from '../../src/types'
import { SCOPES } from '../../src/Scope'
import getStoreScope from '../../src/functions/getStoreScope'
import { createPinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { getCurrentInstance, provide } from 'vue'

const SCOPE_A = 'scope-a'
const SCOPE_B = 'scope-b'

describe('getStoreScope()', () => {

  it('outside of component', async () => {
    expect(
      () => getStoreScope(),
    ).toThrowError('getStoreScope() can only be used inside setup() or functional components.')
  })


  it('can get self set scope', async () => {
    const App = {
      setup() {

        const instance = getCurrentInstance() as any
        instance.__PINIA_SCOPE__ = SCOPE_A

        const scope = getStoreScope()

        return {
          scope,
        }
      },
      template: `
      `,
    }

    const pinia = createPinia()

    expect(SCOPES.keys()).toEqual([])

    const wrapper = mount(App, {
      global: {
        plugins: [pinia],
      },
    })

    await wrapper.vm.$nextTick()
    expect(wrapper.vm.scope).toBe(SCOPE_A)
    expect(SCOPES.keys()).toEqual([])
  })

  it('can get parent injected scope', async () => {

    const Child = {
      setup() {
        const scope = getStoreScope()
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

    const pinia = createPinia()

    expect(SCOPES.keys()).toEqual([])

    const wrapper = mount(App, {
      global: {
        plugins: [pinia],
      },
    })

    await wrapper.vm.$nextTick()

    const child = wrapper.findComponent({ ref: 'child' })

    expect(child.vm.scope).toBe(SCOPE_A)

    expect(SCOPES.keys()).toEqual([])
  })


  it('can get self injected scope instead of parent injected scope', async () => {
    const Child = {
      setup() {
        const instance = getCurrentInstance() as any
        instance.__PINIA_SCOPE__ = SCOPE_B

        const scope = getStoreScope()
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

    const pinia = createPinia()

    expect(SCOPES.keys()).toEqual([])

    const wrapper = mount(App, {
      global: {
        plugins: [pinia],
      },
    })

    await wrapper.vm.$nextTick()

    const child = wrapper.findComponent({ ref: 'child' })

    expect(child.vm.scope).toBe(SCOPE_B)
    expect(SCOPES.keys()).toEqual([])
  })
})
