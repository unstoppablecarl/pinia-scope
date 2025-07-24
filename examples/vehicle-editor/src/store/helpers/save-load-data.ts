import { useEngineStore } from '../engine-store.ts'
import { useVehicleStore } from '../vehicle-store.ts'
import { getStoreUnscopedId } from 'pinia-scope'

export const IMPORT_SCOPE = 'import'

function getStores(scope?: string) {
  return [
    useEngineStore(scope),
    useVehicleStore(scope),
  ]
}

export function makeSaveFileData() {
  const result = {}
  getStores().forEach((store) => {
    const key = store.$id
    result[key] = store.$state
  })

  return result
}

export function loadSaveFileData(data, scope = '') {
  getStores(scope).forEach((store) => {
    let storeId = getStoreUnscopedId(store)

    store.$reset()
    store.$patch(data[storeId])
  })
}

export function jsonFileParser(cb) {
  return (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {

          cb(JSON.parse(e.target.result))

        } catch (error) {
          console.error('Error parsing JSON:', error)
        }
      }
      reader.readAsText(file)
    }
  }
}