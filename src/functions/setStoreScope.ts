import { ScopeOptions, SCOPES } from '../Scope'
import { getCurrentInstance, onUnmounted, provide } from 'vue'
import { injectorKey } from '../types'

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
  SCOPES.init(name, options)
  SCOPES.mounted(name)

  onUnmounted(() => {
    SCOPES.unmounted(name)
  })
}
