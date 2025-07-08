import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createPinia } from 'pinia'
import { getStoreScope, SCOPES, setStoreScope, useStore, useStoreWithoutScope } from '../src'
import { Child1NameStore, Child2NameStore, NameTreeStore } from './helpers/test-stores'
import { onMounted } from 'vue'

const SCOPE_A = 'scope-a'
const SCOPE_B = 'scope-b'

describe('useProvideStores', () => {
  it('can keep separate scoped store trees', async () => {
    const pinia = createPinia()

    const nameA = 'Allison'
    const nameAChild1 = 'Lee'
    const nameAChild2 = 'Smith'

    const nameB = 'Jimmy'
    const nameBChild1 = 'Wong'
    const nameBChild2 = 'Johnson'

    const CompChild2 = {
      setup() {

        const nameStore = useStore(NameTreeStore)
        const child1NameStore = useStore(Child1NameStore)
        const child2NameStore = useStore(Child2NameStore)
        const scope = getStoreScope()

        const nameStoreUnscoped = useStoreWithoutScope(NameTreeStore)
        const child1NameStoreUnscoped = useStoreWithoutScope(Child1NameStore)
        const child2NameStoreUnscoped = useStoreWithoutScope(Child2NameStore)

        return {
          scope,
          nameStore,
          child1NameStore,
          child2NameStore,
          nameStoreUnscoped,
          child1NameStoreUnscoped,
          child2NameStoreUnscoped
        }
      },
      render() {
      },
    }

    const CompChild1 = {
      name: 'CompChild1',
      components: {
        CompChild2,
      },
      props: {
        name: String,
        nameChild1: String,
        nameChild2: String,
        storeScope: String,
      },
      setup(props: any) {
        setStoreScope(props.storeScope as string)

        const scope = getStoreScope()
        const nameStore = useStore(NameTreeStore)
        const child1NameStore = useStore(Child1NameStore)
        const child2NameStore = useStore(Child2NameStore)

        const nameStoreUnscoped = useStoreWithoutScope(NameTreeStore)
        const child1NameStoreUnscoped = useStoreWithoutScope(Child1NameStore)
        const child2NameStoreUnscoped = useStoreWithoutScope(Child2NameStore)

        onMounted(() => {
          nameStore.setName(props.name, props.nameChild1, props.nameChild2)
          nameStoreUnscoped.setName(
            props.name + '-unscoped',
            props.nameChild1 + '-unscoped',
            props.nameChild2 + '-unscoped',
          )
        })

        return {
          scope,
          nameStore,
          child1NameStore,
          child2NameStore,
          nameStoreUnscoped,
          child1NameStoreUnscoped,
          child2NameStoreUnscoped,
        }
      },
      template: `
        <CompChild2 ref="child2" />
      `,
    }

    const App = {
      components: {
        CompChild1,
      },
      props: {
        nameA: String,
        nameAChild1: String,
        nameAChild2: String,
        nameB: String,
        nameBChild1: String,
        nameBChild2: String,
      },
      template: `
        <div>
          <CompChild1
            ref="child1A"
            store-scope="${SCOPE_A}"
            :name="nameA"
            :name-child1="nameAChild1"
            :name-child2="nameAChild2"
          />
          <CompChild1
            ref="child1B"
            store-scope="${SCOPE_B}"
            :name="nameB"
            :name-child1="nameBChild1"
            :name-child2="nameBChild2"
          />
        </div>`,
    }

    const wrapper = mount(App, {
      props: {
        nameA,
        nameAChild1,
        nameAChild2,

        nameB,
        nameBChild1,
        nameBChild2,
      },
      global: {
        plugins: [pinia],
      },
    })

    const compA = wrapper.findComponent({ ref: 'child1A' })
    await compA.vm.$nextTick()

    expect(compA.vm.scope).toBe(SCOPE_A)
    expect(compA.vm.nameStore.name).toBe(nameA)
    expect(compA.vm.nameStoreUnscoped.name).toBe(nameB + '-unscoped')

    expect(compA.vm.child1NameStore.child1Name)
      .toBe('from-name-store: ' + nameAChild1)

    expect(compA.vm.child1NameStoreUnscoped.child1Name)
      .toBe('from-name-store: ' + nameBChild1 + '-unscoped')

    expect(compA.vm.child2NameStore.child2Name)
      .toBe('from-child1-store: from-name-store: ' + nameAChild2)

    expect(compA.vm.child2NameStoreUnscoped.child2Name)
      .toBe('from-child1-store: from-name-store: ' + nameBChild2 + '-unscoped')

    const compA2 = compA.findComponent({ ref: 'child2' })
    expect(compA2.vm.scope).toBe(SCOPE_A)

    expect(compA2.vm.nameStore.name).toBe(nameA)
    expect(compA.vm.nameStoreUnscoped.name).toBe(nameB + '-unscoped')

    expect(compA2.vm.child1NameStore.child1Name)
      .toBe('from-name-store: ' + nameAChild1)

    expect(compA2.vm.child1NameStoreUnscoped.child1Name)
      .toBe('from-name-store: ' + nameBChild1 + '-unscoped')

    expect(compA2.vm.child2NameStore.child2Name)
      .toBe('from-child1-store: from-name-store: ' + nameAChild2)

    expect(compA2.vm.child2NameStoreUnscoped.child2Name)
      .toBe('from-child1-store: from-name-store: ' + nameBChild2 + '-unscoped')

    const compB = wrapper.findComponent({ ref: 'child1B' })
    await compB.vm.$nextTick()
    expect(compB.vm.scope).toBe(SCOPE_B)

    expect(compB.vm.nameStore.name).toBe(nameB)
    expect(compB.vm.nameStoreUnscoped.name).toBe(nameB + '-unscoped')

    expect(compB.vm.child1NameStore.child1Name)
      .toBe('from-name-store: ' + nameBChild1)

    expect(compB.vm.child1NameStoreUnscoped.child1Name)
      .toBe('from-name-store: ' + nameBChild1 + '-unscoped')

    expect(compB.vm.child2NameStore.child2Name)
      .toBe('from-child1-store: from-name-store: ' + nameBChild2)

    expect(compB.vm.child2NameStoreUnscoped.child2Name)
      .toBe('from-child1-store: from-name-store: ' + nameBChild2 + '-unscoped')

    const compB2 = compB.findComponent({ ref: 'child2' })
    expect(compB2.vm.scope).toBe(SCOPE_B)

    expect(compB2.vm.nameStore.name).toBe(nameB)
    expect(compB2.vm.nameStoreUnscoped.name).toBe(nameB + '-unscoped')

    expect(compB2.vm.child1NameStore.child1Name)
      .toBe('from-name-store: ' + nameBChild1)

    expect(compB2.vm.child1NameStoreUnscoped.child1Name)
      .toBe('from-name-store: ' + nameBChild1 + '-unscoped')

    expect(compB2.vm.child2NameStore.child2Name)
      .toBe('from-child1-store: from-name-store: ' + nameBChild2)

    expect(compB2.vm.child2NameStoreUnscoped.child2Name)
      .toBe('from-child1-store: from-name-store: ' + nameBChild2 + '-unscoped')

    expect(SCOPES.keys().sort()).toEqual([SCOPE_A, SCOPE_B].sort())

  })
})
