export type ScopeOptionsInput = {
  readonly autoDispose?: boolean;
  readonly autoClearState?: boolean;
}

export type ScopeOptions = {
  readonly autoDispose: boolean;
  readonly autoClearState: boolean;
}

type ScopeOptionsDiff = {
  key: string,
  option: boolean,
  scope: boolean
}[]

const defaults = {
  autoDispose: true,
  autoClearState: true,
}

export function normalizeScopeOptions(options: ScopeOptionsInput): ScopeOptions {
  return Object.assign({}, defaults, options)
}

export function createDefaultOptionsCollection() {
  const defaultOptions = new Map<string, ScopeOptions>()
  return {
    set(scope: string, options: ScopeOptionsInput) {
      defaultOptions.set(scope, normalizeScopeOptions(options))
    },
    get(scope: string): ScopeOptions {
      return defaultOptions.get(scope) || defaults
    },
  }
}

export function optionsDiffToMessage(diff: ScopeOptionsDiff): string {
  return diff.map(({ key, scope, option }) => {
    return `existing scope.${key} = ${scope}` + '\n' + `option.${key} = ${option}`
  }).join('\n')
}

export function getScopeOptionsDiff(existing: ScopeOptions, options: ScopeOptionsInput): ScopeOptionsDiff {
  const diff = []
  if (options.autoDispose !== undefined &&
    existing.autoDispose !== options.autoDispose) {
    diff.push({
      key: 'autoDispose',
      option: options.autoDispose,
      scope: existing.autoDispose,
    })
  }

  if (options.autoClearState !== undefined &&
    existing.autoClearState !== options.autoClearState) {
    diff.push({
      key: 'autoClearState',
      option: options.autoClearState,
      scope: existing.autoClearState,
    })
  }
  return diff
}