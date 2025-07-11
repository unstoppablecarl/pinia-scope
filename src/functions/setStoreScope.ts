import { getCurrentInstance, onUnmounted, provide } from 'vue'
import { injectorKey, instanceKey } from '../types'
import { getActivePiniaScopeTracker } from '../pinia-scope'
import { ScopeOptionsInput } from '../scope-options'

export default function setStoreScope(name: string, options: ScopeOptionsInput | null = null): void {
  const instance = getCurrentInstance() as any
  if (!instance) {
    throw new Error('setStoreScope() can only be used inside setup() or functional components.')
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
