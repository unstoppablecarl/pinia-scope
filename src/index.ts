export { defineScopeableStore, type StoreCreatorContext } from './functions/defineScopeableStore'
export { getInjectedScope } from './functions/getInjectedScope'
export { setStoreScope } from './functions/setStoreScope'
export { default as StoreScopeProvider } from './components/PiniaScopeProvider'

export {
  attachPiniaScope,
  hasPiniaScope,
  clearPiniaScope,

  disposeOfPiniaScope,
  disposeAndClearStateOfPiniaScope,
} from './pinia-scope'

export { type ScopeOptions } from './scope-options'