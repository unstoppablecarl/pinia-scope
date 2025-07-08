import { getCurrentInstance } from 'vue'
import getStoreScope from './getStoreScope'
import { CreatedStore, StoreCreator } from '../types'
import getStoreWithScope from './getStoreWithScope'
import { StoreGeneric } from 'pinia'

export default function useStore<S extends StoreCreator>(storeCreator: S): CreatedStore<S> {
  if (!getCurrentInstance()) {
    throw new Error('useStore() can only be used inside setup() or functional components.')
  }
  const scope = getStoreScope()

  return getStoreWithScope(storeCreator, scope)
}
