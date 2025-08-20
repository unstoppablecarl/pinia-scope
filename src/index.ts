export type {
  ScopeableStoreOptions,
  ScopeableStoreOptionsCreator,
  StoreCreatorContext,
  ScopeableStoreResult,
  StoreCreator,
  StoreDef,
} from './functions/defineScopeableStore'
export type { NonScopeContext } from './functions/defineNonScopeableStore'
export type { ScopeOptions, ScopeOptionsInput } from './scope-options'

export { getStoreInfo, getStoreUnscopedId, getStoreScope } from './functions/getStoreInfo'
export { defineScopeableStore } from './functions/defineScopeableStore'
export { defineNonScopeableStore } from './functions/defineNonScopeableStore'
export { getComponentScope } from './functions/getComponentScope'
export { setComponentScope } from './functions/setComponentScope'
export { default as StoreScopeProvider } from './components/PiniaScopeProvider'

export {
  attachPiniaScope,
  hasPiniaScope,
  clearPiniaScope,

  disposeOfPiniaScope,
  disposeAndClearStateOfPiniaScope,
  eachStoreOfPiniaScope,
} from './pinia-scope'
