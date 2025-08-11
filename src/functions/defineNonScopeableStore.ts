import { defineStore } from 'pinia'
import {
  makeStoreFactory,
  type ScopeableStoreOptionsObject,
  type ScopeableStoreResult,
  type StoreDef,
} from './defineScopeableStore'

export type NonScopeContext = {
  unScoped: string
}

export function defineNonScopeableStore<Id extends string, SS, SD extends StoreDef<Id, SS>, S = ReturnType<SD>>(
  id: Id,
  storeCreator: (context: NonScopeContext) => SS,
  setupOptions?: ScopeableStoreOptionsObject<Id, SS>,
): ScopeableStoreResult<S> {
  function makeStore(scope: string) {
    if (scope === '') {
      let setup = (): SS => storeCreator({ unScoped: '' })

      const useStore = defineStore(id, setup, setupOptions) as SD
      return useStore() as S
    }
    throw new Error(`Attempting to use un-scopeable store (store id: "${id}") with scope "${scope}".`)
  }

  return makeStoreFactory(makeStore, id)
}