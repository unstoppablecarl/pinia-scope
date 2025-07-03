import { ScopedContext, useStore } from '../../src'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const NameStore_DEFAULT_NAME = 'default-name'

export const NameStore = ({ scopedId, useStore }: ScopedContext) => {
  return defineStore(scopedId('name-store'), () => {
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
  return defineStore(scopedId('name-store'), () => {
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

export const Child1NameStore = (ctx: ScopedContext) => {
  return defineStore(ctx.scopedId('child-1-name-store'), () => {
    const child1Name = ref<string>('')

    const child2NameStore = useStore(Child2NameStore)

    function setChild1Name(nameValue: string, child2Name: string) {
      child1Name.value = nameValue
      child2NameStore.setChild2Name('from-child1-store: ' + child2Name)
    }

    return {
      child1Name: child1Name,
      setChild1Name,
    }
  })
}

export const Child2NameStore = (ctx: ScopedContext) => {
  return defineStore(ctx.scopedId('child-2-name-store'), () => {
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
