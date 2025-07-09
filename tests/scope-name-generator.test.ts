import { beforeEach, describe, expect, it } from 'vitest'
import { setPiniaScopeNameGenerator } from '../src/scope-name-generator'
import { getStoreWithScope } from '../src'
import { NameStore, NameStore_ID } from './helpers/test-stores'
import { createPinia, setActivePinia } from 'pinia'
import { attachPiniaScope } from '../src/pinia-scope'

describe('scope name generator', () => {
  beforeEach(() => {
    const pinia = createPinia()
    attachPiniaScope(pinia)
    setActivePinia(pinia)
  })

  it('generates default scope names', async () => {
    const scopeName = 'scope-name'
    const store = getStoreWithScope(NameStore, scopeName)

    expect(store.$id).toEqual(scopeName + '-' + NameStore_ID)
    expect(store.__PINIA_SCOPE__).toEqual(scopeName)
    expect(store.__PINIA_SCOPE_ID__).toEqual(NameStore_ID)
  })

  it('generates default scope names when scope is empty string', async () => {
    const scopeName = ''
    const store = getStoreWithScope(NameStore, scopeName)

    expect(store.$id).toEqual(NameStore_ID)
    expect(store.__PINIA_SCOPE__).toEqual(scopeName)
    expect(store.__PINIA_SCOPE_ID__).toEqual(NameStore_ID)
  })

  it('generates custom scope names', async () => {
    const scopeName = 'scope-name'
    setPiniaScopeNameGenerator((scope, id) => scope + '-foo-' + id)
    const store = getStoreWithScope(NameStore, scopeName)

    expect(store.$id).toEqual(scopeName + '-foo-' + NameStore_ID)
    expect(store.__PINIA_SCOPE__).toEqual(scopeName)
    expect(store.__PINIA_SCOPE_ID__).toEqual(NameStore_ID)
  })

  it('generates custom scope names when scope is empty string', async () => {
    const scopeName = ''
    setPiniaScopeNameGenerator((scope, id) => scope + '-foo-' + id)
    const store = getStoreWithScope(NameStore, scopeName)

    expect(store.$id).toEqual(NameStore_ID)
    expect(store.__PINIA_SCOPE__).toEqual(scopeName)
    expect(store.__PINIA_SCOPE_ID__).toEqual(NameStore_ID)
  })
})
