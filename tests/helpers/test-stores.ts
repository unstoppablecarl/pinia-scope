import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { ScopedContext } from '../../src/functions/makeContext'

export const NameStore_DEFAULT_NAME = 'default-name'
export const NameStore_ID = 'name-store'

export const NameStore = ({ scopedId }: ScopedContext) => {
  return defineStore(scopedId(NameStore_ID), () => {
    const name = ref<string>(NameStore_DEFAULT_NAME)

    function setName(nameValue: string) {
      name.value = nameValue
    }

    return {
      name,
      setName,
    }
  })
}

export const NameTreeStore = ({ scopedId, useStore }: ScopedContext) => {
  return defineStore(scopedId(NameStore_ID), () => {
    const name = ref<string>('')

    const child1NameStore = useStore(Child1NameStore)

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
}

export const Child1NameStore = ({ scopedId, useStore, useStoreWithoutScope }: ScopedContext) => {
  return defineStore(scopedId('child-1-name-store'), () => {
    const child1Name = ref<string>('')

    const child2NameStore = useStore(Child2NameStore)
    const child2NameStoreWithoutScope = useStoreWithoutScope(Child2NameStore)

    const child2NameWithoutScope = computed(() => child2NameStoreWithoutScope.child2Name)

    function setChild1Name(nameValue: string, child2Name: string) {
      child1Name.value = nameValue
      child2NameStore.setChild2Name('from-child1-store: ' + child2Name)
    }

    return {
      child1Name: child1Name,
      setChild1Name,
      child2NameWithoutScope,
    }
  })
}

export const Child2NameStore = ({ scopedId }: ScopedContext) => {
  return defineStore(scopedId('child-2-name-store'), () => {
    const child2Name = ref<string>('')

    function setChild2Name(nameValue: string) {
      child2Name.value = nameValue
    }

    return {
      setChild2Name,
      child2Name,
    }
  })
}

export function makeStore(id: string) {
  return defineStore(id, () => {
  })()
}
