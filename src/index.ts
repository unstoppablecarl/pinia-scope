export { defineScopeableStore, type StoreCreatorContext } from './functions/defineScopeableStore'
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
} from './pinia-scope'

export { type ScopeOptions } from './scope-options'