import { getCurrentInstance, inject } from 'vue'
import { injectorKey, instanceKey } from '../constants'

export function getComponentScope(): string {
  const instance = getCurrentInstance()
  if (!instance) {
    throw new Error('getComponentScope() can only be used inside setup() or functional components.')
  }
  return getScope(instance)
}

export function getComponentScopeIfAvailable(): string {
  const instance = getCurrentInstance()
  if (instance) {
    return getScope(instance)
  }
  return ''
}

function getScope(instance: any): string {
  const injectedScope = inject(injectorKey, '')
  return instance[instanceKey] || injectedScope
}