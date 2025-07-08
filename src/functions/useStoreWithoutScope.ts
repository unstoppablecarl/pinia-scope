import { CreatedStore, StoreCreator } from '../types'
import getStoreWithScope from './getStoreWithScope'
import { getCurrentInstance } from 'vue'

export type UseStoreWithoutScope = <S extends StoreCreator>(
  storeCreator: S,
) => CreatedStore<S>

const useStoreWithoutScope: UseStoreWithoutScope = (storeCreator) => {
  if (!getCurrentInstance()) {
    throw new Error('useStoreWithoutScope() can only be used inside setup() or functional components.')
  }
  return getStoreWithScope(storeCreator, '')
}

export default useStoreWithoutScope
