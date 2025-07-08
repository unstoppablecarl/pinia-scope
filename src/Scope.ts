import { Store } from 'pinia'

export type ScopeOptions = {
  autoDispose: boolean;
}

const scopes = new Map<string, Scope>()

function initScope(scope: string, options: ScopeOptions | null = null): Scope {

  const result = scopes.get(scope)
  if (result) {
    return result
  }

  const newScope = new Scope(scope, options)
  scopes.set(scope, newScope)

  return newScope
}

export function getPiniaScopes() {
  return SCOPES
}

export const SCOPES = {
  resetForTestingOnly() {
    [...scopes.keys()].forEach(key => scopes.delete(key))
  },
  // for testing only
  keys(): string[] {
    return [...scopes.keys()]
  },
  has(scope: string): boolean {
    return !!scopes.get(scope)
  },
  init: (scope: string, options: ScopeOptions | null = null) => {
    if (scopes.has(scope) && options) {
      const usedScope = scopes.get(scope) as Scope
      if (!usedScope.optionsMatch(options)) {
        throw new Error(`Attempting to use an existing pinia scope "${scope}" with different options`)
      }
    }
    initScope(scope, options)
  },
  addStore(scope: string, store: Store) {
    initScope(scope).addStore(store)
  },
  mounted(scope: string) {
    initScope(scope).mount()
  },
  unmounted(scope: string) {
    const usedScope = scopes.get(scope)
    if (!usedScope) {
      return
    }
    usedScope.unmount()

    if (!usedScope.autoDispose) {
      return
    }

    if (!usedScope.isUsed()) {
      usedScope.dispose()
      scopes.delete(scope)
    }
  },
  useCount(scope: string): number {
    const result = scopes.get(scope)
    if (result) {
      return result.useCount
    }
    return 0
  },
  dispose(scope: string) {
    const result = scopes.get(scope)
    if (result) {
      result.dispose()
    }
  },
}

class Scope {

  readonly id: string
  readonly autoDispose: boolean = true

  private stores: Store[] = []
  private _useCount: number = 0

  get useCount(): number {
    return this._useCount
  }

  constructor(scope: string, options: ScopeOptions | null = null) {
    this.id = scope

    if (options && 'autoDispose' in options) {
      this.autoDispose = options.autoDispose
    }
  }

  optionsMatch(options: ScopeOptions): boolean {
    return this.autoDispose === options.autoDispose
  }

  addStore(store: Store): void {
    this.stores.push(store)
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
    this.stores.forEach((store) => store.$dispose())
  }
}
