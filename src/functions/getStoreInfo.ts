import { STORE_SCOPE_KEY, STORE_UNSCOPED_ID_KEY } from '../constants'
import type { Store } from 'pinia'

export function getStoreUnscopedId(store: Store): string {
  // @ts-ignore
  return store[STORE_UNSCOPED_ID_KEY]
}

export function getStoreScope(store: Store): string {
  // @ts-ignore
  return store[STORE_SCOPE_KEY]
}

export function getStoreInfo(store: Store) {
  return {
    unscopedId: getStoreUnscopedId(store),
    scope: getStoreScope(store),
  }
}
