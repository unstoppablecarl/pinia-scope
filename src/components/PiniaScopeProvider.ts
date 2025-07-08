import { defineComponent } from 'vue'
import setStoreScope from '../functions/setStoreScope'

const PiniaScopeProvider = defineComponent({
  name: 'StoreScopeProvider',
  props: {
    scope: { type: String, required: true },
  },
  setup(props, { slots }) {
    setStoreScope(props.scope as string)

    return () => slots.default?.() || null
  },
})
export default PiniaScopeProvider
