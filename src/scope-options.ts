export type ScopeOptionsInput = {
  readonly autoDispose?: boolean;
  readonly autoClearState?: boolean;
}

export type ScopeOptions = {
  readonly autoDispose: boolean;
  readonly autoClearState: boolean;
}

export type ScopeOptionsList = {
  [key: string]: ScopeOptionsInput
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

export function createDefaultOptionsCollection(optionsList?: ScopeOptionsList) {
  const defaultOptions = new Map<string, ScopeOptions>()

  const get = (scope: string): ScopeOptions => {
    return defaultOptions.get(scope) || defaults
  }

  const set = (scope: string, options: ScopeOptionsInput) => {
    defaultOptions.set(scope, normalizeScopeOptions(options))
  }

  if (optionsList) {
    Object.entries(optionsList)
      .forEach(([scope, options]) => {
        set(scope, normalizeScopeOptions(options))
      })
  }

  return {
    set,
    get,
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