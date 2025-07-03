import { getCurrentInstance, inject, type InjectionKey, provide } from 'vue'
import { type StoreDefinition } from 'pinia'

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
  const injectedScope = inject(injectorKey, '')
  return instance?.__PINIA_SCOPE__ || injectedScope
}

export const useStore: UseStore = (storeCreator) => {
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

function wrapUseStoreWithScope(scope: string) {
  const useStoreScoped: UseStore = (
    storeCreator: StoreCreator,
  ): Store<StoreCreator> => {
    const ctx = makeContext(scope)
    const store = storeCreator(ctx)
    return store()
  }

  return useStoreScoped
}

function makeContext(scope: string): ScopedContext {
  return Object.freeze({
    scopedId: makeScopeId(scope),
    useStore: wrapUseStoreWithScope(scope),
  })
}

function makeScopeId(scope: string) {
  return (id: string) => scope + '-' + id
}
