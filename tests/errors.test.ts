import { describe, expect, it, vi } from 'vitest'
import { createTestingPinia } from '@pinia/testing'
import { getStoreScope, ScopedContext, useStore } from '../src'
import { defineStore } from 'pinia'

describe('Errors', () => {

  it('getStoreScope() should throw warning when out of context', () => {
    expect(
      () => getStoreScope(),
    ).toThrowError('getStoreScope() can only be used inside setup() or functional components.')
  })

  it('useStore() should throw warning when out of context', () => {

    createTestingPinia({
      createSpy: vi.fn,
    })

    const TestStore = (ctx: ScopedContext) => defineStore('foo', () => {
      return {}
    })

    expect(() => useStore(TestStore)).toThrowError('useStore() can only be used inside setup() or functional components.')
  })
})
