import { useNameStore } from '../helpers/test-stores'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

export const Comp3 = {
  name: 'Comp3',
  setup: function() {
    const nameStore = useNameStore()
    const nameStoreWithoutScope = useNameStore.unScoped()

    const { name } = storeToRefs(nameStore)

    const nameWithoutScope = computed(() => nameStoreWithoutScope.name)
    return {
      name,
      nameWithoutScope,
    }
  },
  template: `
		Comp3:[{{name}}][{{nameWithoutScope}}]
  `,
}
export const Comp2 = {
  name: 'Comp2',
  components: {
    Comp3,
  },
  setup() {
    const nameStore = useNameStore()
    const nameStoreWithoutScope = useNameStore.unScoped()

    return {
      nameStore,
      nameStoreWithoutScope,
    }
  },
  template: `
		Comp2:[{{nameStore.name}}][{{nameStoreWithoutScope.name}}]
		<Comp3 ref="comp3" />
  `,
}
