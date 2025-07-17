import { getActivePinia, Pinia } from 'pinia'
import { createScopeTracker, ScopeTracker } from './scope-tracker'
import { ScopeOptions, ScopeOptionsInput } from './scope-options'
import { ScopeNameGenerator } from './functions/createScopeNameFactory'

// A Symbol would be better, but it doesn't work
// in vite hot-module reloading environment
// const KEY = Symbol('PINIA_SCOPE_TRACKER')
const KEY = '__PINIA_SCOPE_TRACKER__'

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

export function setScopeOptionsDefault(scope: string, options: ScopeOptionsInput): void {
  getActiveTracker('setScopeOptionsDefault')
    .setScopeOptionsDefault(scope, options)
}

export function getScopeOptionsDefault(scope: string): ScopeOptions {
  return getActiveTracker('getScopeOptionsDefault')
    .getScopeOptionsDefault(scope)
}

export function setPiniaScopeNameGenerator(scopeNameGenerator: ScopeNameGenerator): void {
  return getActiveTracker('setPiniaScopeNameGenerator')
    .setPiniaScopeNameGenerator(scopeNameGenerator)
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