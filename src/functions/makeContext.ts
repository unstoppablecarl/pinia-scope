import { StoreFactory } from '../types'
import getStoreWithScope from './getStoreWithScope'
import { ScopeNameGenerator } from './createScopeNameFactory'

export type ScopedContext = {
  readonly getBaseStoreId: () => string | null
  readonly addScope: (id: string) => string
  readonly useStore: StoreFactory
  readonly useStoreWithoutScope: StoreFactory
}

export default function makeContext(scope: string, scopeNameGenerator: ScopeNameGenerator): ScopedContext {

  const useStore: StoreFactory = (storeCreator) => {
    return getStoreWithScope(storeCreator, scope)
  }

  const useStoreWithoutScope: StoreFactory = (storeCreator) => {
    return getStoreWithScope(storeCreator, '')
  }

  let lastStoreId: string | null = null

  return {
    getBaseStoreId: () => lastStoreId,
    addScope: (id: string) => {
      lastStoreId = id
      if (scope) {
        return scopeNameGenerator(scope, id)
      }
      return id
    },
    useStore,
    useStoreWithoutScope,
  }
}
