import { getCurrentInstance, inject } from 'vue'
import { injectorKey, instanceKey } from '../types'

export default function getComponentStoreScope(): string {
  const instance = getCurrentInstance() as any
  if (!instance) {
    throw new Error('getComponentStoreScope() can only be used inside setup() or functional components.')
  }

  const injectedScope = inject(injectorKey, '')
  return instance[instanceKey] || injectedScope
}
