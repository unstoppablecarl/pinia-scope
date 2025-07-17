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
import getComponentStoreScope from './getComponentStoreScope'
import { DefaultStoreBehavior } from '../scope-tracker'

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
  (): S;
  componentScoped(): S;
  scoped(scope: string): S;
  unScoped(): S;
}

export type StoreDef<Id extends string, SS> = StoreDefinition<Id, _ExtractStateFromSetupStore<SS>, _ExtractGettersFromSetupStore<SS>, _ExtractActionsFromSetupStore<SS>>

export default function defineScopeableStore<Id extends string, SS, DS extends StoreDef<Id, SS>, S = ReturnType<DS>>(
  id: Id,
  storeCreator: (ctx: { scope: string }) => SS,
  setupOptions?: ScopeableStoreOptions<Id, SS>,
): ScopeableStoreResult<S> {

  function makeStore(scope: string, options: ScopeOptionsInput | null = null) {
    const tracker = getActiveTracker('defineScopeableStore')
    const context = { scope }
    const scopedId = tracker.makeScopedId(scope, id) as string
    const setup = (): SS => storeCreator(context)
    const useStore = defineStore(scopedId, setup, setupOptions) as DS
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

  function componentScoped(): S {
    return makeStore(getComponentStoreScope())
  }

  function unScoped(): S {
    return makeStore('')
  }

  function factory(): S {
    const tracker = getActiveTracker('defineScopeableStore')
    if (tracker.getDefaultStoreBehavior() === DefaultStoreBehavior.unScoped) {
      return unScoped()
    }
    return componentScoped()
  }

  factory.componentScoped = componentScoped
  factory.unScoped = unScoped
  factory.scoped = (scope: string): S => makeStore(scope)

  return factory
}