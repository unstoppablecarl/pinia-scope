import { describe, expect, it } from 'vitest'
import { createDefaultOptionsCollection } from '../../src/scope-options'

const SCOPE_A = 'scope-a'

describe('scope options', async () => {

  it('sets and gets options', async () => {
    const collection = createDefaultOptionsCollection()

    let options = {
      autoClearState: true,
      autoDispose: false,
    }
    collection.set(SCOPE_A, options)
    expect(collection.get(SCOPE_A)).toEqual(options)
  })

  it('returns defaults when not set', async () => {
    const collection = createDefaultOptionsCollection()
    expect(collection.get(SCOPE_A)).toEqual({
      autoClearState: true,
      autoDispose: true,
    })
  })
})
