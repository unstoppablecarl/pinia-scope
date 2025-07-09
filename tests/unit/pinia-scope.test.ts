import { describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import {
  attachPiniaScope,
  clearPiniaScope,
  disposeAndClearStateOfPiniaScope,
  disposeOfPiniaScope,
  getActivePiniaScopeTracker,
  getPiniaScopeTracker,
  hasPiniaScope,
  attachPiniaScopeTracker,
} from '../../src/pinia-scope'
import * as scopeTracker from '../../src/scope-tracker'
import { createScopeTracker } from '../../src/scope-tracker'

const SCOPE_A = 'scope-a'

describe('pinia-scope APIs', () => {
  it('testing attachPiniaScope(), clearPiniaScope(), hasPiniaScope()', async () => {
    const createScopeTrackerSpy = vi.spyOn(scopeTracker, 'createScopeTracker')
    const pinia = createPinia()
    attachPiniaScope(pinia)

    const scopeTrackerObj = createScopeTrackerSpy.mock.results[0].value
    expect(getPiniaScopeTracker(pinia)).toBe(scopeTrackerObj)
    expect(hasPiniaScope(pinia)).toBe(true)

    clearPiniaScope(pinia)
    expect(getPiniaScopeTracker(pinia)).toBe(undefined)
    expect(hasPiniaScope(pinia)).toBe(false)
  })

  it('throws an error if already attached', async () => {
    expect(
      () => {
        const pinia = createPinia()
        attachPiniaScope(pinia)
        attachPiniaScope(pinia)
      },
    ).toThrowError('attachPiniaScope()": was called but pinia scope is already attached.')
  })

  it('test disposeOfPiniaScope()', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const scopeTrackerObj = createScopeTracker(pinia)
    const scopeTrackerSpy = vi.spyOn(scopeTrackerObj, 'dispose')

    attachPiniaScopeTracker(pinia, scopeTrackerObj)
    disposeOfPiniaScope(SCOPE_A)
    expect(scopeTrackerSpy).toHaveBeenCalledExactlyOnceWith(SCOPE_A)
  })


  it('disposeOfPiniaScope() throws an error when pinia-scope is not attached', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)

    expect(() => {
      disposeOfPiniaScope(SCOPE_A)
    }).toThrowError('"disposeOfPiniaScope()": pinia-scope has not been attached. Did you forget to call attachPiniaScope(pinia) ?')
  })

  it('test disposeAndClearStateOfPiniaScope()', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const scopeTrackerObj = createScopeTracker(pinia)
    const scopeTrackerSpy = vi.spyOn(scopeTrackerObj, 'disposeAndClearState')

    attachPiniaScopeTracker(pinia, scopeTrackerObj)
    disposeAndClearStateOfPiniaScope(SCOPE_A)
    expect(scopeTrackerSpy).toHaveBeenCalledExactlyOnceWith(SCOPE_A)
  })

  it('disposeAndClearStateOfPiniaScope() throws an error when pinia-scope is not attached', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)

    expect(() => {
      disposeAndClearStateOfPiniaScope(SCOPE_A)
    }).toThrowError('"disposeAndClearStateOfPiniaScope()": pinia-scope has not been attached. Did you forget to call attachPiniaScope(pinia) ?')
  })

  it('test getActivePiniaScopeTracker()', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const scopeTrackerObj = createScopeTracker(pinia)
    attachPiniaScopeTracker(pinia, scopeTrackerObj)
    expect(getActivePiniaScopeTracker()).toEqual(scopeTrackerObj)
  })

  it('getActivePiniaScopeTracker() throws an error when not attached', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)

    expect(() => {
      getActivePiniaScopeTracker()
    }).toThrowError('"getActivePiniaScopeTracker()": pinia-scope has not been attached. Did you forget to call attachPiniaScope(pinia) ?')
  })
})


