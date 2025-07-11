import { StoreFactory } from '../types'
import { SCOPE_NAME_GENERATOR } from '../scope-name-generator'
import getStoreWithScope from './getStoreWithScope'

export type ScopedContext = {
  readonly getBaseStoreId: () => string | null
  readonly addScope: (id: string) => string
  readonly useStore: StoreFactory
  readonly useStoreWithoutScope: StoreFactory
}

export default function makeContext(scope: string): ScopedContext {

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
        return SCOPE_NAME_GENERATOR(scope, id)
      }
      return id
    },
    useStore,
    useStoreWithoutScope,
  }
}
