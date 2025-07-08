import { afterEach, beforeEach } from 'vitest'
import { setActivePinia } from 'pinia'
import { enableAutoUnmount } from '@vue/test-utils'
import { SCOPES } from '../src'

enableAutoUnmount(afterEach)

beforeEach(() => {
  setActivePinia(undefined)
  SCOPES.resetForTestingOnly()
})
