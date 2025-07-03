import { defineComponent } from 'vue'
import { setStoreScope } from './use'

const StoreScopeProvider = defineComponent({
  name: 'StoreScopeProvider',
  props: {
    scope: { type: String, required: false },
  },
  setup(props, { slots }) {
    setStoreScope(props.scope as string)

    return () => slots.default?.() || null
  },
})
export default StoreScopeProvider
