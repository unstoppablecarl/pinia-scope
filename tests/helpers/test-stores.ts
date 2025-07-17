import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { defineScopeableStore, ScopedContext } from '../../src/functions/defineScopeableStore'

export const NameStore_DEFAULT_NAME = 'default-name'
export const NameStore_ID = 'name-store'

export const useNameStore = defineScopeableStore(NameStore_ID, ({ scope }: ScopedContext) => {
  const name = ref<string>(NameStore_DEFAULT_NAME)

  function setName(nameValue: string) {
    name.value = nameValue
  }

  return {
    name,
    setName,
  }

})
export const useNameTreeStore = defineScopeableStore(NameStore_ID, ({ scope }: ScopedContext) => {
  const name = ref<string>('')

  const child1NameStore = useChild1NameStore(scope)

  function setName(
    nameValue: string,
    child1NameValue: string,
    child2NameValue: string,
  ) {
    name.value = nameValue
    child1NameStore.setChild1Name(
      'from-name-store: ' + child1NameValue,
      'from-name-store: ' + child2NameValue,
    )
  }

  return {
    name,
    setName,
  }
})

export const useChild1NameStore = defineScopeableStore('child-1-name-store', ({ scope }: ScopedContext) => {
  const child1Name = ref<string>('')

  const child2NameStore = useChild2NameStore(scope)
  const child2NameStoreWithoutScope = useChild2NameStore()

  const child2NameWithoutScope = computed(() => child2NameStoreWithoutScope.child2Name)

  function setChild1Name(nameValue: string, child2Name: string) {
    child1Name.value = nameValue
    child2NameStore.setChild2Name('from-child1-store: ' + child2Name)
  }

  return {
    child1Name: child1Name,
    setChild1Name,
    child2NameWithoutScope,
    child2NameStoreWithoutScopeId: child2NameStoreWithoutScope.$id,
  }
})
export const Child2NameStore_NAME = 'child2-name-store'

export const useChild2NameStore = defineScopeableStore(Child2NameStore_NAME, ({ scope }: ScopedContext) => {

  const child2Name = ref<string>('')

  function setChild2Name(nameValue: string) {
    child2Name.value = nameValue
  }

  return {
    setChild2Name,
    child2Name,
  }
})


export function makeStore(id: string) {
  return defineStore(id, () => {
    const some = ref('state')

    return {
      some,
    }
  })()
}
