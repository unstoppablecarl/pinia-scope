export { default as StoreScopeProvider } from './components/PiniaScopeProvider'
export { default as getStoreScope } from './functions/getStoreScope'
export { default as getStoreWithScope } from './functions/getStoreWithScope'
export { default as setStoreScope } from './functions/setStoreScope'
export { default as useStore } from './functions/useStore'
export { default as useStoreWithoutScope } from './functions/useStoreWithoutScope'
export { setPiniaScopeNameGenerator, type ScopeNameGenerator } from './scope-name-generator'
export {
  type StoreFactory,
  type StoreCreator,
  type CreatedStore,
} from './types'

export { type ScopedContext } from './functions/makeContext'
export {type ScopeOptions, getPiniaScopes} from './Scope'
