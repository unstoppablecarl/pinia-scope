import { beforeEach, describe, expect, it } from 'vitest'
import { NameStore_ID, useNameStore } from './helpers/test-stores'
import { createPinia, Pinia, setActivePinia } from 'pinia'
import { attachPiniaScope } from '../src/pinia-scope'

describe('scope name factory', () => {
  beforeEach(() => {
    const pinia = createPinia()
    attachPiniaScope(pinia)
    setActivePinia(pinia)
  })

  it('generates default scope names', async () => {
    const scopeName = 'scope-name'
    const store = useNameStore(scopeName)

    expect(store.$id).toEqual(scopeName + '-' + NameStore_ID)
  })

  it('generates default scope names when scope is empty string', async () => {
    const scopeName = ''
    const store = useNameStore(scopeName)

    expect(store.$id).toEqual(NameStore_ID)
  })

  it('generates custom scope names', async () => {
    let pinia: Pinia = createPinia()
    attachPiniaScope(pinia, {
      scopeNameGenerator: (scope: string, id: string) => scope + '-foo-' + id,
    })
    setActivePinia(pinia)

    const scopeName = 'scope-name'
    const store = useNameStore(scopeName)

    expect(store.$id).toEqual(scopeName + '-foo-' + NameStore_ID)
  })

  it('generates custom scope names when scope is empty string', async () => {
    const scopeName = ''
    let pinia: Pinia = createPinia()
    attachPiniaScope(pinia, {
      scopeNameGenerator: (scope: string, id: string) => scope + '-foo-' + id,
    })
    setActivePinia(pinia)
    const store = useNameStore(scopeName)

    expect(store.$id).toEqual(NameStore_ID)
  })
})
