import { defineComponent } from 'vue'
import setStoreScope from '../functions/setStoreScope'

const PiniaScopeProvider = defineComponent({
  name: 'StoreScopeProvider',
  props: {
    scope: { type: String, required: true },
    autoDispose: { type: Boolean, default: true },
    autoClearState: { type: Boolean, default: true },
  },
  setup(props, { slots }) {
    setStoreScope(
      props.scope,
      {
        autoDispose: props.autoDispose,
        autoClearState: props.autoClearState,
      },
    )

    return () => slots.default?.() || null
  },
})
export default PiniaScopeProvider
