export type ScopeNameGenerator = (scope: string, id: string) => string;

export default function createScopeNameFactory() {
  let generator: ScopeNameGenerator = (scope: string, id: string): string => {
    return `${scope}-${id}`
  }

  const generate: ScopeNameGenerator = (scope: string, id: string): string => generator(scope, id)

  const set = (scopeNameGenerator: ScopeNameGenerator): void => {
    generator = scopeNameGenerator
  }

  return {
    generate,
    set,
  }
}