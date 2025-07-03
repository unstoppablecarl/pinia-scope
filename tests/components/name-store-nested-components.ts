import { useStore } from '../../src'
import { NameStore } from '../helpers/test-stores'
import { storeToRefs } from 'pinia'

export const Comp3 = {
  name: 'Comp3',
  setup() {
    const nameStore = useStore(NameStore)
    const { name } = storeToRefs(nameStore)
    return {
      name,
    }
  },
  template: `
    Comp3:[{{name}}]
  `,
}
export const Comp2 = {
  name: 'Comp2',
  components: {
    Comp3,
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
    Comp2:[{{nameStore.name}}]
    <Comp3 ref="comp3" />
  `,
}
