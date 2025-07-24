import { getCurrentInstance, onUnmounted, provide } from 'vue'
import { INJECTOR_KEY, INSTANCE_KEY } from '../constants'
import { getActivePiniaScopeTracker } from '../pinia-scope'
import { type ScopeOptionsInput } from '../scope-options'

export function setComponentScope(name: string, options?: ScopeOptionsInput): void {
  const instance = getCurrentInstance() as any
  if (!instance) {
    throw new Error('setComponentScope() can only be used inside setup() or functional components.')
  }
  instance[INSTANCE_KEY] = name
  provide(INJECTOR_KEY, name)

  if (name === '') {
    return
  }
  const tracker = getActivePiniaScopeTracker()
  tracker.init(name, options)
  tracker.mounted(name)

  onUnmounted(() => {
    tracker.unmounted(name)
  })
}
