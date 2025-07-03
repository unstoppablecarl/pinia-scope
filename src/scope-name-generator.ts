export type ScopeNameGenerator = (scope: string, id: string) => string;

let SCOPE_NAME_GENERATOR: ScopeNameGenerator = (scope: string, id: string): string => {
  return `${scope}-${id}`
}

export function setPiniaScopeNameGenerator(scopeNameGenerator: ScopeNameGenerator): void {
  SCOPE_NAME_GENERATOR = scopeNameGenerator
}

export function makeScopeId(scope: string) {
  return (id: string) => {
    if (scope) {
      return SCOPE_NAME_GENERATOR(scope, id)
    }
    return id
  }
}
