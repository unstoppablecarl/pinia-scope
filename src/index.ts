export { default as defineScopedStore } from './functions/defineScopeableStore'
export { default as StoreScopeProvider } from './components/PiniaScopeProvider'
export { default as getStoreScope } from './functions/getComponentStoreScope'
export { default as setStoreScope } from './functions/setStoreScope'
export { type ScopeNameGenerator } from './functions/createScopeNameFactory'

export {
  attachPiniaScope,
  hasPiniaScope,
  clearPiniaScope,

  disposeOfPiniaScope,
  disposeAndClearStateOfPiniaScope,

  setScopeOptionsDefault,
  getScopeOptionsDefault,

  setPiniaScopeNameGenerator,
  setDefaultStoreBehavior,


  getPiniaScopeTracker,
} from './pinia-scope'

export { type ScopeOptions } from './scope-options'
export { DefaultStoreBehavior } from './scope-tracker'