import { mount, VueWrapper } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createPinia, getActivePinia, storeToRefs } from 'pinia'
import { getStoreWithScope, setStoreScope, useStore } from '../src'
import { NameStore, NameStore_DEFAULT_NAME } from './helpers/test-stores'
import { Comp2, Comp3 } from './components/name-store-nested-components'
import PiniaScopeProvider from '../src/components/PiniaScopeProvider'
import { SCOPES } from '../src/Scope'

const pinia = createPinia()

const SCOPE_A = 'scope-a'
const SCOPE_B = 'scope-b'

describe('setStoreScope() used in component', () => {
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
    setup() {
    },
    template: `
      <div>
        <Comp1 store-scope="${SCOPE_A}" ref="comp1-a" />
        <Comp1 store-scope="${SCOPE_B}" ref="comp1-b" />
      </div>`,
  }


  it('can keep separate scoped trees', async () => {
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

    expect(SCOPES.useCount(SCOPE_A)).toEqual(4)
    expect(SCOPES.useCount(SCOPE_B)).toEqual(4)
  })

  it('can maintain usage count', async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [pinia],
      },
    })

    const wrapper2 = mount(App, {
      global: {
        plugins: [pinia],
      },
    })

    expect(SCOPES.useCount(SCOPE_A)).toEqual(8)
    expect(SCOPES.useCount(SCOPE_B)).toEqual(8)

    wrapper2.unmount()

    expect(SCOPES.useCount(SCOPE_A)).toEqual(4)
    expect(SCOPES.useCount(SCOPE_B)).toEqual(4)

    wrapper.unmount()

    expect(SCOPES.has(SCOPE_A)).toEqual(false)
    expect(SCOPES.has(SCOPE_B)).toEqual(false)

    const activePinia = getActivePinia()

    const stores = (activePinia as any)._s
    expect([...stores.keys()]).toEqual(['name-store'])
  })
})

describe('StoreScopeProvider component', () => {
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
      PiniaScopeProvider,
    },
    template: `
      <div>
        <PiniaScopeProvider scope="${SCOPE_A}" />
        <PiniaScopeProvider scope="${SCOPE_A}">
          <Comp1 ref="comp1-a" />
        </PiniaScopeProvider>
        <PiniaScopeProvider scope="${SCOPE_B}">
          <Comp1 ref="comp1-b" />
        </PiniaScopeProvider>
      </div>`,
  }

  it('StoreScopeProvider component can keep separate scoped trees', async () => {

    const wrapper = mount(App, {
      global: {
        plugins: [pinia],
      },
    })

    await testTree(wrapper)

    expect(SCOPES.useCount(SCOPE_A)).toEqual(5)
    expect(SCOPES.useCount(SCOPE_B)).toEqual(4)
  })

  it('can maintain usage count', async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [pinia],
      },
    })

    await wrapper.unmount()

    expect(SCOPES.has(SCOPE_A)).toEqual(false)
    expect(SCOPES.has(SCOPE_B)).toEqual(false)

    const activePinia = getActivePinia()

    const stores = (activePinia as any)._s
    expect([...stores.keys()]).toEqual(['name-store'])

  })
})

async function testTree(wrapper: VueWrapper) {
  const newName = 'bobby'
  const newName2 = 'jimmy'
  const storeA = getStoreWithScope(NameStore, SCOPE_A)
  storeA.setName(newName)

  const storeAWithoutScope = getStoreWithScope(NameStore, '')
  storeAWithoutScope.setName(newName2)

  await wrapper.vm.$nextTick()

  const caseAComp1 = wrapper.findComponent({ ref: 'comp1-a' })

  expect(caseAComp1.exists()).toBe(true)
  expect(caseAComp1.text()).toEqual([
    `Comp1:[${newName}]`,
    `Comp2:[${newName}][${newName2}]`,
    `Comp3:[${newName}][${newName2}]`,
  ].join(''))

  const caseAComp2 = caseAComp1.findComponent({ ref: 'comp2' })
  expect(caseAComp2.exists()).toBe(true)
  expect(caseAComp2.text()).toEqual([
    `Comp2:[${newName}][${newName2}]`,
    `Comp3:[${newName}][${newName2}]`,
  ].join(''))


  const caseAComp3 = caseAComp2.findComponent({ ref: 'comp3' })
  expect(caseAComp3.exists()).toBe(true)
  expect(caseAComp3.text()).toEqual(`Comp3:[${newName}][${newName2}]`)

  const caseBComp1 = wrapper.findComponent({ ref: 'comp1-b' })

  expect(caseBComp1.exists()).toBe(true)
  expect(caseBComp1.text()).toEqual([
    `Comp1:[${NameStore_DEFAULT_NAME}]`,
    `Comp2:[${NameStore_DEFAULT_NAME}][${newName2}]`,
    `Comp3:[${NameStore_DEFAULT_NAME}][${newName2}]`,
  ].join(''))

  const caseBComp2 = caseBComp1.findComponent({ ref: 'comp2' })
  expect(caseBComp2.exists()).toBe(true)
  expect(caseBComp2.text()).toEqual([
    `Comp2:[${NameStore_DEFAULT_NAME}][${newName2}]`,
    `Comp3:[${NameStore_DEFAULT_NAME}][${newName2}]`,
  ].join(''))

  const caseBComp3 = caseBComp2.findComponent({ ref: 'comp3' })
  expect(caseBComp3.exists()).toBe(true)
  expect(caseBComp3.text()).toEqual(`Comp3:[${NameStore_DEFAULT_NAME}][${newName2}]`)

  expect(SCOPES.keys().sort()).toEqual([SCOPE_A, SCOPE_B].sort())

  return {
    caseAComp1,
    caseAComp2,
    caseAComp3,
    caseBComp1,
    caseBComp2,
    caseBComp3,
  }
}
