import { describe, expect, it } from 'vitest'
import { makeScopeId, setPiniaScopeNameGenerator } from '../src/scope-name-generator'

describe('scope name generator', () => {
  it('generates default scope names', async () => {
    let scopeName = 'scope-name'
    const makeScope = makeScopeId(scopeName)
    const id = 'test-id'
    expect(makeScope(id)).toEqual(scopeName + '-' + id)
  })

  it('generates default scope names when scope is empty string', async () => {
    let scopeName = ''
    const makeScope = makeScopeId(scopeName)
    const id = 'test-id'
    expect(makeScope(id)).toEqual(id)
  })

  it('generates custom scope names', async () => {
    let scopeName = 'scope-name'
    const makeScope = makeScopeId(scopeName)
    const id = 'test-id'

    setPiniaScopeNameGenerator((scope, id) => scope + '-foo-' + id)
    expect(makeScope(id)).toEqual(scopeName + '-foo-' + id)
  })


  it('generates custom scope names when scope is empty string', async () => {
    let scopeName = ''
    const makeScope = makeScopeId(scopeName)
    const id = 'test-id'

    setPiniaScopeNameGenerator((scope, id) => scope + '-foo-' + id)
    expect(makeScope(id)).toEqual(id)
  })
})
