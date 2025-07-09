import { Store } from 'pinia'
import piniaStoreClearState from './functions/piniaStoreClearState'

export type ScopeOptions = {
  autoDispose?: boolean;
  autoClearState?: boolean;
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

      const diff = usedScope.getOptionsDiff(options)

      if (diff.length) {
        let message = `Attempting to use an existing pinia scope "${scope}" with different options:`
        diff.forEach(({ key, scope, option }) => {
          message += '\n' + `existing scope.${key} = ${scope}` + '\n' + `option.${key} = ${option}`
        })

        throw new Error(message)
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

    if (usedScope.isUsed()) {
      return
    }

    if (usedScope.autoDispose) {
      if (usedScope.autoClearState) {
        SCOPES.disposeAndClearState(scope)
      } else {
        SCOPES.dispose(scope)
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
  dispose(scope: string) {
    const result = scopes.get(scope)
    if (result) {
      result.dispose()
      scopes.delete(scope)
    }
  },
  disposeAndClearState(scope: string) {
    const result = scopes.get(scope)
    if (result) {
      result.disposeAndClearState()
      scopes.delete(scope)
    }
  },
}

class Scope {
  readonly id: string
  readonly autoDispose: boolean = true
  readonly autoClearState: boolean = true

  private stores: Store[] = []
  private _useCount: number = 0

  get useCount(): number {
    return this._useCount
  }

  constructor(scope: string, options: ScopeOptions | null = null) {
    this.id = scope

    if (!options) {
      return
    }

    if (options?.autoDispose !== undefined) {
      this.autoDispose = options.autoDispose
    }

    if (options?.autoClearState !== undefined) {
      this.autoClearState = options.autoClearState
    }
  }

  getOptionsDiff(options: ScopeOptions): {
    key: string,
    option: boolean,
    scope: boolean
  }[] {

    const diff = []
    if (options.autoDispose !== undefined &&
      this.autoDispose !== options.autoDispose) {
      diff.push({
        key: 'autoDispose',
        option: options.autoDispose,
        scope: this.autoDispose,
      })
    }

    if (options.autoClearState !== undefined &&
      this.autoClearState !== options.autoClearState) {
      diff.push({
        key: 'autoClearState',
        option: options.autoClearState,
        scope: this.autoClearState,
      })
    }

    return diff
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
    this.stores.forEach((store) => {
      store.$dispose()
    })
  }

  disposeAndClearState(): void {
    this.stores.forEach((store) => {
      store.$dispose()
      piniaStoreClearState(store)
    })
  }
}
