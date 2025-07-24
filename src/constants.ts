import { type InjectionKey } from 'vue'

// Stryker disable all

// A Symbol would be better, but it doesn't work
// in vite hot-module reloading environment
// export const SCOPE_TRACKER_KEY = Symbol(__DEV__ ? 'Pinia Scope: Tracker' : '')
export const SCOPE_TRACKER_KEY = '__PINIA_SCOPE_TRACKER__'

/* v8 ignore next -- @preserve */
export const INJECTOR_KEY: InjectionKey<string> = Symbol(__DEV__ ? 'Pinia Scope: Injector Key' : '')
/* v8 ignore next -- @preserve */
export const INSTANCE_KEY = Symbol(__DEV__ ? 'Pinia Scope: Instance Key' : '')
/* v8 ignore next -- @preserve */
export const STORE_UNSCOPED_ID_KEY = Symbol(__DEV__ ? 'Pinia Scope: Store Unscoped Id' : '')
/* v8 ignore next -- @preserve */
export const STORE_SCOPE_KEY = Symbol(__DEV__ ? 'Pinia Scope: Store Scope' : '')