import { ScopeOptions } from '../scope-tracker'
import { getCurrentInstance, onUnmounted } from 'vue'
import { CreatedStore, StoreCreator } from '../types'
import makeContext from './makeContext'
import { getActivePiniaScopeTracker } from '../pinia-scope'

export type GetStoreWithScope = <S extends StoreCreator>(
  storeCreator: S,
  scope: string,
) => CreatedStore<S>

const getStoreWithScope: GetStoreWithScope = (
  storeCreator,
  scope: string,
  options: ScopeOptions | null = null,
) => {
  const ctx = makeContext(scope)
  const store = storeCreator(ctx)

  const storeId = ctx.lastStoreId()

  if (!storeId) {
    throw new Error('Attempting to use a Pinia Scoped Store that did not call scopedId().')
  }

  const result = store()
  result.__PINIA_SCOPE__ = scope
  result.__PINIA_SCOPE_ID__ = storeId

  if (scope !== '') {
    const tracker = getActivePiniaScopeTracker()

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

