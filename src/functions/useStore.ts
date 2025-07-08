import { getCurrentInstance } from 'vue'
import getStoreScope from './getStoreScope'
import { StoreCreator } from '../types'
import getStoreWithScope from './getStoreWithScope'
import { StoreGeneric } from 'pinia'

export default function useStore(storeCreator: StoreCreator): StoreGeneric {
  if (!getCurrentInstance()) {
    throw new Error('useStore() can only be used inside setup() or functional components.')
  }
  const scope = getStoreScope()

  return getStoreWithScope(storeCreator, scope)
}
