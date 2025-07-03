import { mount, VueWrapper } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createPinia, storeToRefs } from 'pinia'
import { getStoreWithScope, setStoreScope, useStore } from '../src'
import { NameStore, NameStore_DEFAULT_NAME } from './helpers/test-stores'
import { Comp2, Comp3 } from './components/name-store-nested-components'
import PiniaScopeProvider from '../src/PiniaScopeProvider'

const pinia = createPinia()

const SCOPE_A = 'scope-a'
const SCOPE_B = 'scope-b'

describe('pinia-scope', () => {
  it('setStoreScope can keep separate scoped trees', async () => {
    const Comp1 = {
      name: 'Comp1',
      components: {
        Comp2,
      },
      props: {
        storeScope: String,
      },
      setup(props: { storeScope: string }) {
        setStoreScope(props.storeScope)
        const nameStore = useStore(NameStore)
        const { name } = storeToRefs(nameStore)
        return {
          nameStore,
          name,
        }
      },
      template: `
        Comp1:[{{name}}]
        <Comp2 ref="comp2" />
      `,
    }

    const App = {
      components: {
        Comp1,
      },
      setup() {},
      template: `
        <div>
          <Comp1 store-scope="${SCOPE_A}" ref="comp1-a" />
          <Comp1 store-scope="${SCOPE_B}" ref="comp1-b" />
        </div>`,
    }

    const wrapper = mount(App, {
      global: {
        plugins: [pinia],
      },
    })

    expect(wrapper.findComponent(Comp1).html()).toContain(
      `Comp1:[${NameStore_DEFAULT_NAME}]`,
    )
    expect(wrapper.findComponent(Comp2).html()).toContain(
      `Comp2:[${NameStore_DEFAULT_NAME}]`,
    )
    expect(wrapper.findComponent(Comp3).html()).toContain(
      `Comp3:[${NameStore_DEFAULT_NAME}]`,
    )

    await testTree(wrapper)
  })

  it('StoreScopeProvider component can keep separate scoped trees', async () => {
    const Comp1 = {
      name: 'Comp1',
      components: {
        Comp2,
      },
      setup() {
        const nameStore = useStore(NameStore)
        const { name } = storeToRefs(nameStore)
        return {
          nameStore,
          name,
        }
      },
      template: `
        Comp1:[{{name}}]
        <Comp2 ref="comp2" />
      `,
    }

    const App = {
      components: {
        Comp1,
        StoreScopeProvider: PiniaScopeProvider,
      },
      template: `
        <div>
          <StoreScopeProvider scope="${SCOPE_A}" />
          <StoreScopeProvider scope="${SCOPE_A}">
            <Comp1 ref="comp1-a" />
          </StoreScopeProvider>
          <StoreScopeProvider scope="${SCOPE_B}">
            <Comp1 ref="comp1-b" />
          </StoreScopeProvider>
        </div>`,
    }

    const wrapper = mount(App, {
      global: {
        plugins: [pinia],
      },
    })

    await testTree(wrapper)
  })
})

async function testTree(wrapper: VueWrapper) {
  const newName = 'bobby'
  const storeA = getStoreWithScope(NameStore, SCOPE_A)
  storeA.setName(newName)

  await wrapper.vm.$nextTick()

  const caseAComp1 = wrapper.findComponent({ ref: 'comp1-a' })

  expect(caseAComp1.exists()).toBe(true)
  expect(caseAComp1.html()).toContain(`Comp1:[${newName}]`)
  expect(caseAComp1.html()).toContain(`Comp2:[${newName}]`)
  expect(caseAComp1.html()).toContain(`Comp3:[${newName}]`)

  const caseAComp2 = caseAComp1.findComponent({ ref: 'comp2' })
  expect(caseAComp2.exists()).toBe(true)
  expect(caseAComp2.html()).toContain(`Comp2:[${newName}]`)
  expect(caseAComp2.html()).toContain(`Comp3:[${newName}]`)

  const caseAComp3 = caseAComp2.findComponent({ ref: 'comp3' })
  expect(caseAComp3.exists()).toBe(true)
  expect(caseAComp3.html()).toContain(`Comp3:[${newName}]`)

  const caseBComp1 = wrapper.findComponent({ ref: 'comp1-b' })

  expect(caseBComp1.exists()).toBe(true)
  expect(caseBComp1.html()).toContain(`Comp1:[${NameStore_DEFAULT_NAME}]`)
  expect(caseBComp1.html()).toContain(`Comp2:[${NameStore_DEFAULT_NAME}]`)
  expect(caseBComp1.html()).toContain(`Comp3:[${NameStore_DEFAULT_NAME}]`)

  const caseBComp2 = caseBComp1.findComponent({ ref: 'comp2' })
  expect(caseBComp2.exists()).toBe(true)
  expect(caseBComp2.html()).toContain(`Comp2:[${NameStore_DEFAULT_NAME}]`)
  expect(caseBComp2.html()).toContain(`Comp3:[${NameStore_DEFAULT_NAME}]`)

  const caseBComp3 = caseBComp2.findComponent({ ref: 'comp3' })
  expect(caseBComp3.exists()).toBe(true)
  expect(caseBComp3.html()).toContain(`Comp3:[${NameStore_DEFAULT_NAME}]`)
}
