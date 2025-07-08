export type ScopeNameGenerator = (scope: string, id: string) => string;

export let SCOPE_NAME_GENERATOR: ScopeNameGenerator = (scope: string, id: string): string => {
  return `${scope}-${id}`
}

export function setPiniaScopeNameGenerator(scopeNameGenerator: ScopeNameGenerator): void {
  SCOPE_NAME_GENERATOR = scopeNameGenerator
}
