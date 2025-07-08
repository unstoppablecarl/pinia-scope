import { getCurrentInstance } from 'vue'
import getStoreScope from './getStoreScope'
import { StoreCreator, GenericStore } from '../types'
import  getStoreWithScope  from './getStoreWithScope'

export default function useStore(storeCreator: StoreCreator): GenericStore {
  if (!getCurrentInstance()) {
    throw new Error('useStore() can only be used inside setup() or functional components.')
  }
  const scope = getStoreScope()

  return getStoreWithScope(storeCreator, scope)
}
