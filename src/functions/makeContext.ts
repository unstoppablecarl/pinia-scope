import { CreatedStore, GenericStore, StoreCreator } from '../types'
import { SCOPE_NAME_GENERATOR } from '../scope-name-generator'
import getStoreWithScope from './getStoreWithScope'

export type ScopedContext = {
  readonly scopedId: (id: string) => string
  readonly useStore: GenericStore
  readonly useStoreWithoutScope: GenericStore
  readonly lastStoreId: () => string | null
  readonly clearLastStoreId: () => void
}

export default function makeContext(scope: string): ScopedContext {

  const useStore: GenericStore = (
    storeCreator: StoreCreator,
  ): CreatedStore<StoreCreator> => {
    return getStoreWithScope(storeCreator, scope)
  }

  const useStoreWithoutScope: GenericStore = (
    storeCreator: StoreCreator,
  ): CreatedStore<StoreCreator> => {
    return getStoreWithScope(storeCreator, '')
  }

  let lastStoreId: string | null = null

  return Object.freeze({
    lastStoreId: () => lastStoreId,
    clearLastStoreId: () => lastStoreId = null,
    scopedId: (id: string) => {
      lastStoreId = id
      if (scope) {
        return SCOPE_NAME_GENERATOR(scope, id)
      }
      return id
    },
    useStore,
    useStoreWithoutScope,
  })
}
