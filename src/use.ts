import { getCurrentInstance, inject, type InjectionKey, provide } from 'vue'
import { type StoreDefinition } from 'pinia'
import { makeScopeId } from './scope-name-generator'

export const injectorKey: InjectionKey<string> = Symbol(
  'Pinia Scope Injector Key',
)

export type Store<S extends StoreCreator> = ReturnType<ReturnType<S>>

export type StoreCreator = (
  ctx: ScopedContext,
) => StoreDefinition<string, any, any, any>
export type UseStore = <S extends StoreCreator>(storeCreator: S) => Store<S>
export type GetStoreWithScope = <S extends StoreCreator>(
  storeCreator: S,
  scope: string,
) => Store<S>

export type ScopedContext = {
  readonly scopedId: (id: string) => string
  readonly useStore: UseStore
}

export const setStoreScope = (name: string): void => {
  const instance = getCurrentInstance() as any
  if (instance) {
    instance.__PINIA_SCOPE__ = name
  }
  provide(injectorKey, name)
}

export function getStoreScope(): string {
  const instance = getCurrentInstance() as any
  if (!instance) {
    throw new Error('getStoreScope() can only be used inside setup() or functional components.')
  }

  const injectedScope = inject(injectorKey, '')
  return instance?.__PINIA_SCOPE__ || injectedScope
}

export const useStore: UseStore = (storeCreator) => {
  if (!getCurrentInstance()) {
    throw new Error('useStore() can only be used inside setup() or functional components.')
  }
  const scope = getStoreScope()

  return getStoreWithScope(storeCreator, scope)
}

export const getStoreWithScope: GetStoreWithScope = (
  storeCreator,
  scope: string = '',
) => {
  const ctx = makeContext(scope)
  const store = storeCreator(ctx)
  return store()
}


function makeContext(scope: string): ScopedContext {

  const useStoreScoped: UseStore = (
    storeCreator: StoreCreator,
  ): Store<StoreCreator> => {
    return getStoreWithScope(storeCreator, scope)
  }

  return Object.freeze({
    scopedId: makeScopeId(scope),
    useStore: useStoreScoped,
  })
}
