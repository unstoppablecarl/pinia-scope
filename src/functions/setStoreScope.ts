import { ScopeOptions } from '../scope-tracker'
import { getCurrentInstance, onUnmounted, provide } from 'vue'
import { injectorKey } from '../types'
import { getActivePiniaScopeTracker } from '../pinia-scope'

export default function setStoreScope(name: string, options: ScopeOptions | null = null): void {
  const instance = getCurrentInstance() as any
  if (!instance) {
    throw new Error('setStoreScope() can only be used inside setup() or functional components.')
  }
  instance.__PINIA_SCOPE__ = name
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
