import {
  type _ExtractActionsFromSetupStore,
  type _ExtractGettersFromSetupStore,
  type _ExtractStateFromSetupStore,
  type DefineSetupStoreOptions,
  defineStore,
  type Store,
  type StoreDefinition,
} from 'pinia'
import { getActiveTracker } from '../pinia-scope'
import { type ScopeOptionsInput } from '../scope-options'
import { getCurrentInstance, onUnmounted } from 'vue'
import { getComponentScope, getComponentScopeIfAvailable } from './getComponentScope'
import { STORE_SCOPE_KEY, STORE_UNSCOPED_ID_KEY } from '../constants'

export type ScopedContext = {
  scope: string;
}

export type ScopeableStoreOptions<Id extends string, SS> =
  ScopeableStoreOptionsObject<Id, SS>
  | ScopeableStoreOptionsCreator<Id, SS>

export type ScopeableStoreOptionsObject<Id extends string, SS> = DefineSetupStoreOptions<
  Id,
  _ExtractStateFromSetupStore<SS>,
  _ExtractGettersFromSetupStore<SS>,
  _ExtractActionsFromSetupStore<SS>
>

export interface ScopeableStoreOptionsCreator<Id extends string, SS> {
  (scope: string): ScopeableStoreOptionsObject<Id, SS>
}

export type ScopeableStoreResult<S> = {
  (scope?: string, options?: ScopeOptionsInput): S;
  componentScoped(): S;
  unScoped(): S;
}
export type StoreCreatorContext = { scope: string }
export type StoreCreator<SS> = {
  (context: StoreCreatorContext): SS,
}

export type StoreDef<Id extends string, SS> = StoreDefinition<Id, _ExtractStateFromSetupStore<SS>, _ExtractGettersFromSetupStore<SS>, _ExtractActionsFromSetupStore<SS>>

let definingStoreDepth = 0

export function getDefiningStoreDepth(): number {
  return definingStoreDepth
}

export function defineScopeableStore<Id extends string, SS, SD extends StoreDef<Id, SS>, S = ReturnType<SD>>(
  id: Id,
  storeCreator: StoreCreator<SS>,
  setupOptions?: ScopeableStoreOptions<Id, SS>,
): ScopeableStoreResult<S> {

  function makeStore(scope: string, options?: ScopeOptionsInput) {
    const tracker = getActiveTracker('defineScopeableStore')
    const context = { scope }
    const scopedId = tracker.makeScopedId(scope, id)

    let setup = (): SS => storeCreator(context)
    if (__DEV__) {
      if (tracker.autoInjectScope()) {
        setup = (): SS => {
          definingStoreDepth++
          try {
            return storeCreator(context)
          } finally {
            definingStoreDepth--
          }
        }
      }
    }
    let finalSetupOptions: ScopeableStoreOptionsObject<Id, SS> | undefined
    if (typeof setupOptions === 'function') {
      finalSetupOptions = setupOptions(scope)
    } else {
      finalSetupOptions = setupOptions
    }

    const useStore = defineStore(scopedId, setup, finalSetupOptions) as SD
    const store = useStore() as S

    //@ts-ignore
    store[STORE_UNSCOPED_ID_KEY] = id
    //@ts-ignore
    store[STORE_SCOPE_KEY] = scope

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

  return makeStoreFactory<Id, S>(makeStore, id)
}

export function makeStoreFactory<Id, S>(makeStore: (scope: string, options?: ScopeOptionsInput) => S, id: Id) {
  function componentScoped(): S {
    return makeStore(getComponentScope())
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
      if (__DEV__ && definingStoreDepth > 0) {
        console.warn(`[Pinia Scope]: Attempting to auto-inject scope from a component via "useMyStore()" with store id: "${id}" inside of another store. You should do "useMyStore(scope)" or "useMyStore.unScoped()" instead.`)
      }
      return makeStore(getComponentScopeIfAvailable())
    }
    return unScoped()
  }

  factory.componentScoped = componentScoped
  factory.unScoped = unScoped

  return factory
}