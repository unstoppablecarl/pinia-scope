import { ScopeOptions, SCOPES } from '../Scope'
import { getCurrentInstance, onUnmounted } from 'vue'
import { CreatedStore, StoreCreator } from '../types'
import makeContext from './makeContext'

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
  ctx.clearLastStoreId()

  if (!storeId) {
    throw new Error('Attempting to use a Pinia Scoped Store that did not call scopedId().')
  }

  const result = store()
  result.__PINIA_SCOPE__ = scope
  result.__PINIA_SCOPE_ID__ = storeId

  if (scope !== '') {
    SCOPES.init(scope, options)
    SCOPES.addStore(scope, result)

    if (getCurrentInstance()) {
      SCOPES.mounted(scope)

      onUnmounted(() => {
        SCOPES.unmounted(scope)
      })
    }
  }

  return result
}
export default getStoreWithScope

