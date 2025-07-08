import { Store } from 'pinia'

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

export const SCOPES = {
  keys(): string[] {
    return [...scopes.keys()]
  },
  init: (scope: string, options: ScopeOptions | null) => {
    if (scopes.has(scope) && options) {
      const usedScope = scopes.get(scope) as Scope
      if (!usedScope.optionsMatch(options)) {
        throw new Error('Attempting to use an existing scope with different options')
      }
    }
    initScope(scope, options)
  },
  get(scope: string): Scope | undefined {
    return scopes.get(scope)
  },
  addStore(scope: string, store: Store) {
    initScope(scope).addStore(store)
  },
  mounted(scope: string) {
    initScope(scope).mount()
  },
  unmounted(scope: string) {
    let usedScope = initScope(scope)
    usedScope.unmount()

    if (!usedScope.isUsed()) {
      if (usedScope.autoDispose) {
        usedScope.dispose()
        scopes.delete(scope)
      }
    }
  },
}

export type ScopeOptions = {
  autoDispose: boolean;
}

export class Scope {

  readonly id: string
  readonly autoDispose: boolean

  private stores: Store[] = []
  private _useCount: number = 0

  get useCount(): number {
    return this._useCount
  }

  constructor(scope: string, options: ScopeOptions | null = null) {
    this.id = scope
    this.autoDispose = options?.autoDispose || true
  }

  optionsMatch(options: ScopeOptions) {
    return this.autoDispose === options.autoDispose
  }

  addStore(store: Store): void {
    this.stores.push(store)
  }

  mount() {
    this._useCount++
  }

  unmount() {
    this._useCount--
  }

  isUsed(): boolean {
    return this._useCount > 0
  }

  dispose() {
    this.stores.forEach((store) => store.$dispose())
  }
}
