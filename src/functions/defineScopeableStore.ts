import {
  _ExtractActionsFromSetupStore,
  _ExtractGettersFromSetupStore,
  _ExtractStateFromSetupStore,
  DefineSetupStoreOptions,
  defineStore,
  Store,
  StoreDefinition,
} from 'pinia'
import { getActiveTracker } from '../pinia-scope'
import { ScopeOptionsInput } from '../scope-options'
import { getCurrentInstance, onUnmounted } from 'vue'
import { getInjectedScope } from './getInjectedScope'

export type ScopedContext = {
  scope: string;
}

export type ScopeableStoreOptions<Id extends string, SS> = DefineSetupStoreOptions<
  Id,
  _ExtractStateFromSetupStore<SS>,
  _ExtractGettersFromSetupStore<SS>,
  _ExtractActionsFromSetupStore<SS>
>

export type ScopeableStoreResult<S> = {
  (scope?: string, options?: ScopeOptionsInput): S;
  injectedScope(): S;
  unScoped(): S;
}
export type StoreCreatorContext = { scope: string }
export type StoreCreator<R> = {
  (context: StoreCreatorContext): R,
}

export type StoreDef<Id extends string, SS> = StoreDefinition<Id, _ExtractStateFromSetupStore<SS>, _ExtractGettersFromSetupStore<SS>, _ExtractActionsFromSetupStore<SS>>

export function defineScopeableStore<Id extends string, SS, SD extends StoreDef<Id, SS>, S = ReturnType<SD>>(
  id: Id,
  storeCreator: StoreCreator<SS>,
  setupOptions?: ScopeableStoreOptions<Id, SS>,
): ScopeableStoreResult<S> {

  function makeStore(scope: string, options?: ScopeOptionsInput) {
    const tracker = getActiveTracker('defineScopeableStore')
    const context = { scope }
    const scopedId = tracker.makeScopedId(scope, id)
    const setup = (): SS => storeCreator(context)
    const useStore = defineStore(scopedId, setup, setupOptions) as SD
    const store = useStore() as S

    if (scope !== '') {
      tracker.init(scope, options)
      tracker.addStore(scope, store as Store)

      if (getCurrentInstance()) {
        tracker.mounted(scope)

        onUnmounted(() => {
          tracker.unmounted(scope)
        })
      }
    }

    return store
  }

  function injectedScope(): S {
    return makeStore(getInjectedScope())
  }

  function unScoped(): S {
    return makeStore('')
  }

  function factory(scope?: string, options?: ScopeOptionsInput): S {
    if (scope !== undefined) {
      return makeStore(scope, options)
    }

    const tracker = getActiveTracker('defineScopeableStore')
    if (tracker.autoInjectScope()) {
      return injectedScope()
    }
    return unScoped()
  }

  factory.injectedScope = injectedScope
  factory.unScoped = unScoped

  return factory
}