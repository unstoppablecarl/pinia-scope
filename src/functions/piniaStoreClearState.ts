import { getActivePinia, type Store } from 'pinia'

export default function piniaStoreClearState(store: Store): void {
  const pinia = getActivePinia()

  delete pinia?.state.value[store.$id]
}