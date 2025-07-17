import { getCurrentInstance, inject } from 'vue'
import { injectorKey, instanceKey } from '../constants'

export function getInjectedScope(): string {
  const instance = getCurrentInstance() as any
  if (!instance) {
    throw new Error('getInjectedScope() can only be used inside setup() or functional components.')
  }

  const injectedScope = inject(injectorKey, '')
  return instance[instanceKey] || injectedScope
}
