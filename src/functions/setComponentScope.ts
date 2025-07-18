import { getCurrentInstance, onUnmounted, provide } from 'vue'
import { injectorKey, instanceKey } from '../constants'
import { getActivePiniaScopeTracker } from '../pinia-scope'
import { type ScopeOptionsInput } from '../scope-options'

export function setComponentScope(name: string, options?: ScopeOptionsInput): void {
  const instance = getCurrentInstance() as any
  if (!instance) {
    throw new Error('setComponentScope() can only be used inside setup() or functional components.')
  }
  instance[instanceKey] = name
  provide(injectorKey, name)

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
