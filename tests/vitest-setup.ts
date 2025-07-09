import { afterEach, beforeEach } from 'vitest'
import { setActivePinia } from 'pinia'
import { enableAutoUnmount } from '@vue/test-utils'

enableAutoUnmount(afterEach)

beforeEach(() => {
  setActivePinia(undefined)
})
