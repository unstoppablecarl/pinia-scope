import { getCurrentInstance, inject } from 'vue'
import { INJECTOR_KEY, INSTANCE_KEY } from '../constants'

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
  const injectedScope = inject(INJECTOR_KEY, '')
  return instance[INSTANCE_KEY] || injectedScope
}