import { getActivePinia, type Pinia, type Store } from 'pinia'
import { createScopeTracker, type ScopeTracker, type ScopeTrackerOptions } from './scope-tracker'
import { SCOPE_TRACKER_KEY } from './constants'

export function attachPiniaScope(pinia: Pinia, options?: ScopeTrackerOptions): void {
  if (hasPiniaScope(pinia)) {
    throw new Error('"attachPiniaScope()": was called but pinia scope is already attached.')
  }
  attachPiniaScopeTracker(pinia, createScopeTracker(pinia, options))
}

export function hasPiniaScope(pinia: Pinia): boolean {
  // @ts-ignore
  return !!pinia[SCOPE_TRACKER_KEY]
}

export function clearPiniaScope(pinia: Pinia): void {
  // @ts-ignore
  delete pinia[SCOPE_TRACKER_KEY]
}

export function attachPiniaScopeTracker(pinia: Pinia, scopeTracker: ScopeTracker): void {
  // @ts-ignore
  pinia[SCOPE_TRACKER_KEY] = scopeTracker
}

export function getPiniaScopeTracker(pinia: Pinia): ScopeTracker {
  // @ts-ignore
  return pinia[SCOPE_TRACKER_KEY]
}

export function getActivePiniaScopeTracker(): ScopeTracker {
  return getActiveTracker('getActivePiniaScopeTracker')
}

export function disposeOfPiniaScope(scope: string): void {
  getActiveTracker('disposeOfPiniaScope')
    .dispose(scope)
}

export function eachStoreOfPiniaScope(scope: string, callback: (store: Store) => void): void {
  getActiveTracker('eachStoreOfPiniaScope')
    .eachStore(scope, callback)
}

export function disposeAndClearStateOfPiniaScope(scope: string): void {
  getActiveTracker('disposeAndClearStateOfPiniaScope')
    .disposeAndClearState(scope)
}

export function getActiveTracker(methodName: string): ScopeTracker {
  const pinia = getActivePinia() as Pinia
  if (!pinia) {
    throw new Error(
      `[🍍]: "${methodName}()" was called but there was no active Pinia. Are you trying to use a store before calling "app.use(pinia)"?
See https://pinia.vuejs.org/core-concepts/outside-component-usage.html for help.
This will fail in production.`)
  }

  const scopeTracker = getPiniaScopeTracker(pinia)
  if (!scopeTracker) {
    throw new Error(`"${methodName}()": pinia-scope has not been attached. Did you forget to call attachPiniaScope(pinia) ?`)
  }
  return scopeTracker
}