import { Pinia, Store } from 'pinia'
import {
  createDefaultOptionsCollection,
  getScopeOptionsDiff,
  normalizeScopeOptions,
  optionsDiffToMessage,
  ScopeOptions,
  ScopeOptionsInput,
  ScopeOptionsList,
} from './scope-options'

export type ScopeTracker = ReturnType<typeof createScopeTracker>

export type ScopeTrackerOptions = {
  autoInjectScope?: boolean,
  scopeDefaults?: ScopeOptionsList,
  scopeNameGenerator?: ScopeNameGenerator,
}
export type ScopeNameGenerator = (scope: string, id: string) => string;

export function createScopeTracker(pinia: Pinia, options?: ScopeTrackerOptions) {
  const autoInjectScope = options?.autoInjectScope ?? false
  const scopes = new Map<string, Scope>()
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
      const newScope = new Scope(pinia, scope, options)
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
    disposeAndClearState,
    makeScopedId(scope: string, id: string): string {
      if (scope === '') {
        return id
      }

      return scopeNameGenerator(scope, id)
    },
  }
}

class Scope {
  readonly pinia: Pinia
  readonly id: string
  readonly autoDispose: boolean
  readonly autoClearState: boolean

  private stores: Store[] = []
  private _useCount: number = 0

  get useCount(): number {
    return this._useCount
  }

  constructor(pinia: Pinia, scope: string, options: ScopeOptions) {
    this.pinia = pinia
    this.id = scope

    this.autoDispose = options.autoDispose
    this.autoClearState = options.autoClearState
  }

  options(): ScopeOptions {
    return {
      autoDispose: this.autoDispose,
      autoClearState: this.autoClearState,
    }
  }

  addStore(store: Store): void {
    if (!this.stores.includes(store)) {
      this.stores.push(store)
    }
  }

  mount(): void {
    this._useCount++
  }

  unmount(): void {
    this._useCount--
  }

  isUsed(): boolean {
    return this._useCount > 0
  }

  dispose(): void {
    this.stores.forEach((store) => {
      store.$dispose()
    })
  }

  disposeAndClearState(): void {
    this.stores.forEach((store) => {
      store.$dispose()
      delete this.pinia.state.value[store.$id]
    })
  }
}


function defaultGenerator(scope: string, id: string): string {
  return `${scope}-${id}`
}