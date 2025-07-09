import { getActivePinia, Pinia } from 'pinia'
import { createScopeTracker, ScopeTracker } from './scope-tracker'

const KEY = Symbol('PINIA_SCOPE')

export function attachPiniaScope(pinia: Pinia): void {
  if (hasPiniaScope(pinia)) {
    throw new Error('"attachPiniaScope()": was called but pinia scope is already attached.')
  }
  attachPiniaScopeTracker(pinia, createScopeTracker(pinia))
}

export function hasPiniaScope(pinia: Pinia): boolean {
  // @ts-ignore
  return !!pinia[KEY]
}

export function clearPiniaScope(pinia: Pinia): void {
  // @ts-ignore
  delete pinia[KEY]
}

export function attachPiniaScopeTracker(pinia: Pinia, scopeTracker: ScopeTracker): void {
  // @ts-ignore
  pinia[KEY] = scopeTracker
}

export function getPiniaScopeTracker(pinia: Pinia): ScopeTracker {
  // @ts-ignore
  return pinia[KEY]
}

export function getActivePiniaScopeTracker(): ScopeTracker {
  return getActiveTracker('getActivePiniaScopeTracker')
}

export function disposeOfPiniaScope(scope: string): void {
  getActiveTracker('disposeOfPiniaScope')
    .dispose(scope)
}

export function disposeAndClearStateOfPiniaScope(scope: string): void {
  getActiveTracker('disposeAndClearStateOfPiniaScope')
    .disposeAndClearState(scope)
}

function getActiveTracker(methodName: string): ScopeTracker {
  const pinia = getActivePinia() as Pinia
  const scopeTracker = getPiniaScopeTracker(pinia)
  if (!scopeTracker) {
    throw new Error(`"${methodName}()": pinia-scope has not been attached. Did you forget to call attachPiniaScope(pinia) ?`)
  }
  return scopeTracker
}