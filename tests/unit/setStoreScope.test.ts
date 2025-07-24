import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setComponentScope } from '../../src/functions/setComponentScope'
import { createPinia, type Pinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { getCurrentInstance, useTemplateRef } from 'vue'
import { createScopeTracker } from '../../src/scope-tracker'
import { attachPiniaScopeTracker } from '../../src/pinia-scope'
import { INSTANCE_KEY } from '../../src/constants'

const SCOPE_A = 'scope-a'

describe('setComponentScope()', () => {

  let pinia: Pinia

  let scopeInitSpy: any
  let scopeMountedSpy: any
  let scopeUnmountedSpy: any

  beforeEach(() => {
    pinia = createPinia()

    let tracker = createScopeTracker(pinia)

    scopeInitSpy = vi.spyOn(tracker, 'init')
    scopeMountedSpy = vi.spyOn(tracker, 'mounted')
    scopeUnmountedSpy = vi.spyOn(tracker, 'unmounted')

    attachPiniaScopeTracker(pinia, tracker)
  })

  it('outside of component', async () => {
    expect(
      () => setComponentScope(SCOPE_A),
    ).toThrowError('setComponentScope() can only be used inside setup() or functional components.')
  })

  it('set scope with default options', async () => {
    const options = { autoDispose: true }

    const App = {
      setup() {
        setComponentScope(SCOPE_A, options)

        const child = useTemplateRef('child')
        const instance = getCurrentInstance() as any
        const instanceScope = instance[INSTANCE_KEY]

        return {
          child,
          instanceScope,
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
    expect(wrapper.vm.instanceScope).toBe(SCOPE_A)
    expect(scopeInitSpy).toHaveBeenCalledExactlyOnceWith(SCOPE_A, options)
    expect(scopeMountedSpy).toHaveBeenCalledExactlyOnceWith(SCOPE_A)

    wrapper.unmount()

    expect(scopeUnmountedSpy).toHaveBeenCalledWith(SCOPE_A)
  })


  it('set empty string scope with no options', async () => {
    const App = {
      setup() {
        setComponentScope('')

        const instance = getCurrentInstance() as any
        const instanceScope = instance[INSTANCE_KEY]

        return {
          instanceScope,
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
    expect(wrapper.vm.instanceScope).toBe('')

    expect(scopeInitSpy).toHaveBeenCalledTimes(0)
    expect(scopeMountedSpy).toHaveBeenCalledTimes(0)

    wrapper.unmount()

    expect(scopeUnmountedSpy).toHaveBeenCalledTimes(0)
  })
})
