import { getCurrentInstance, onUnmounted } from 'vue'
import { CreatedStore, StoreCreator } from '../types'
import makeContext from './makeContext'
import { getActiveTracker } from '../pinia-scope'
import { ScopeOptionsInput } from '../scope-options'

export type GetStoreWithScope = <S extends StoreCreator>(
  storeCreator: S,
  scope: string,
) => CreatedStore<S>

const getStoreWithScope: GetStoreWithScope = (
  storeCreator,
  scope: string,
  options: ScopeOptionsInput | null = null,
) => {
  const tracker = getActiveTracker('getStoreWithScope')

  const ctx = makeContext(scope)
  const store = storeCreator(ctx)

  const storeId = ctx.getBaseStoreId()
  if (!storeId) {
    throw new Error('Attempting to use a Pinia Scoped Store that did not call addScope().')
  }

  const result = store()

  if (scope !== '') {

    tracker.init(scope, options)
    tracker.addStore(scope, result)

    if (getCurrentInstance()) {
      tracker.mounted(scope)

      onUnmounted(() => {
        tracker.unmounted(scope)
      })
    }
  }

  return result
}
export default getStoreWithScope

