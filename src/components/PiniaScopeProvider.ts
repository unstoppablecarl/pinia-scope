import { defineComponent } from 'vue'
import { setComponentScope } from '../functions/setComponentScope'

const PiniaScopeProvider = defineComponent({
  name: 'StoreScopeProvider',
  props: {
    scope: { type: String, required: true },
    autoDispose: { type: Boolean, default: true },
    autoClearState: { type: Boolean, default: true },
  },
  setup(props, { slots }) {
    setComponentScope(
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
