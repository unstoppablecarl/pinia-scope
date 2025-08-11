import { type Pinia, type Store } from 'pinia'
import {
  createDefaultOptionsCollection,
  getScopeOptionsDiff,
  normalizeScopeOptions,
  optionsDiffToMessage,
  type ScopeOptions,
  type ScopeOptionsInput,
  type ScopeOptionsList,
} from './scope-options'

export type ScopeTracker = ReturnType<typeof createScopeTracker>

export type Scope = ReturnType<typeof createScope>

export type ScopeTrackerOptions = {
  autoInjectScope?: boolean,
  scopeDefaults?: ScopeOptionsList,
  scopeNameGenerator?: ScopeNameGenerator,
}
export type ScopeNameGenerator = (scope: string, id: string) => string;

const defaultGenerator = (scope: string, id: string): string => `${scope}-${id}`

export function createScopeTracker(pinia: Pinia, options?: ScopeTrackerOptions) {
  const scopes = new Map<string, Scope>()
  const autoInjectScope = options?.autoInjectScope ?? true
  const defaultOptions = createDefaultOptionsCollection(options?.scopeDefaults)
  const scopeNameGenerator = options?.scopeNameGenerator ?? defaultGenerator

  function dispose(scope: string) {
    const result = scopes.get(scope)
    if (result) {
      result.dispose()
      scopes.delete(scope)
    }
  }

  function disposeAndClearState(scope: string) {
    const result = scopes.get(scope)
    if (result) {
      result.disposeAndClearState()
      scopes.delete(scope)
    }
  }

  return {
    autoInjectScope: (): boolean => autoInjectScope,
    keys(): string[] {
      return [...scopes.keys()]
    },
    get(scope: string): Scope | undefined {
      return scopes.get(scope)
    },
    has(scope: string): boolean {
      return !!scopes.get(scope)
    },
    init: (scope: string, optionsInput?: ScopeOptionsInput) => {
      const existingScope = scopes.get(scope)
      if (existingScope) {
        if (optionsInput) {
          const diff = getScopeOptionsDiff(existingScope.options(), optionsInput)
          if (diff.length) {
            throw new Error(`Attempting to initialize an existing pinia scope "${scope}" with different options:` + '\n' +
              optionsDiffToMessage(diff))
          }
        }

        return existingScope
      }

      let options: ScopeOptions
      if (optionsInput) {
        options = normalizeScopeOptions(optionsInput)
      } else {
        options = defaultOptions.get(scope)
      }
      const newScope = createScope(pinia, scope, options)
      scopes.set(scope, newScope)

      return newScope
    },
    addStore(scope: string, store: Store) {
      const usedScope = scopes.get(scope) as Scope
      usedScope.addStore(store)
    },
    mounted(scope: string) {
      const usedScope = scopes.get(scope) as Scope
      usedScope.mount()
    },
    unmounted(scope: string) {
      const usedScope = scopes.get(scope)
      if (!usedScope) {
        return
      }
      usedScope.unmount()

      if (usedScope.isUsed()) {
        return
      }

      if (usedScope.autoDispose) {
        if (usedScope.autoClearState) {
          disposeAndClearState(scope)
        } else {
          dispose(scope)
        }
      }
    },
    useCount(scope: string): number {
      const result = scopes.get(scope)
      if (result) {
        return result.useCount
      }
      return 0
    },
    dispose,
    eachStore(scope: string, callback: (store: Store) => void) {
      const result = scopes.get(scope)
      if (result) {
        return result.eachStore(callback)
      }
    },
    disposeAndClearState,
    makeScopedId(scope: string, id: string): string {
      if (scope === '') {
        return id
      }

      return scopeNameGenerator(scope, id)
    },
  }
}


function createScope(pinia: Pinia, scope: string, options: ScopeOptions) {
  const autoDispose = options.autoDispose
  const autoClearState = options.autoClearState
  const stores: Store[] = []
  let useCount: number = 0

  return {
    get scope(): string {
      return scope
    },
    get autoDispose(): boolean {
      return autoDispose
    },
    get autoClearState(): boolean {
      return autoClearState
    },
    get useCount(): number {
      return useCount
    },
    options(): ScopeOptions {
      return {
        autoDispose,
        autoClearState,
      }
    },
    addStore(store: Store): void {
      if (!stores.includes(store)) {
        stores.push(store)
      }
    },
    mount(): void {
      useCount++
    },
    unmount(): void {
      useCount--
    },
    isUsed(): boolean {
      return useCount > 0
    },
    eachStore(cb: (store: Store) => void): void {
      stores.forEach(cb)
    },
    dispose(): void {
      stores.forEach((store) => {
        store.$dispose()
      })
    },
    disposeAndClearState(): void {
      stores.forEach((store) => {
        store.$dispose()
        delete pinia.state.value[store.$id]
      })
    },
  }
}