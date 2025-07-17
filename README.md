# Pinia Scope

Scoped [Pinia](https://pinia.vuejs.org/) Stores for [Vue.js](https://vuejs.org/)

## Concept

Pinia Scope allows creating dynamically scoped versions of Pinia stores.
A scope is a string that prefixes one or more Pinia Store ids separating them from their un-scoped version.
After setting the scope of a component, its child components inherit that scope.
This allows dynamic creation and disposal of the data layer and improved component re-use in a Vue app.

## Installation

`$ npm i pinia-scope`

Attach pinia scope to the pinia instance in your `main.js` file.

```js
// main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

// add import here
import { attachPiniaScope } from 'pinia-scope'

const app = createApp(App)
const pinia = createPinia()

// attaching here
attachPiniaScope(pinia)

app.use(pinia)
app.mount('#app')
```

## Usage

### What is a Scope?

Pinia stores have a `store.$id` set when defining the store.
A scoped store has a scope string prefixed onto its `store.$id`:

```js
// normal pinia code
export const useMyStore = (scope: string = '') => {
  const myStore = defineStore(scope + 'my-store-id', () => { /* ... */
  })
  return myStore()
}

const myUnscopedStore = useMyStore()
myUnscopedStore.$id // 'my-store-id'
const myScopedStore = useMyStore('preview-scope-') // 'preview-scope-my-store-id'
```

The above lets you create separate instances of the same store, but does not have the Abilities of:

🔥**Pinia Scope** 🔥:

- Apply scope to other stores it uses internally
- Handle component scope inheritance
- Handle cleaning up scoped stores after they are done being used

### Defining Stores

Stores created with pinia's `defineStore()` are wrapped in a store creator function.

#### Normal Pinia Store

Definition

```ts
// vehicle-store.ts
import { defineStore } from 'pinia'

export const useVehicleStore = defineStore('vehicles', () => {
  //...
})
```

Usage in Component

```ts
import { useVehicleStore } from 'vehicle-store.ts'

const vehicleStore = useVehicleStore()
```

#### Scoped Pinia Store

Definition

```ts
// vehicle-store.ts
import { defineStore } from 'pinia'
import { type ScopedContext } from 'pinia-scope'

export const VehicleStore = ({ addScope }: ScopedContext) => {
  // wrap the store id with the addScope() function
  return defineStore(addScope('vehicles'), () => {
    //...
  })
}
```

Usage in Component

```ts
import { useStore } from 'pinia-scope'
import { VehicleStore } from 'vehicle-store.ts'

const vehicleStore = useStore(VehicleStore)
```

### Scoped Context

Store Creators are passed a `ScopedContext` object.

```ts
// vehicle-store.ts
import { defineStore } from 'pinia'
import { type ScopedContext } from 'pinia-scope'
import { TireStore } from 'tire-store.ts'

export const VehicleStore = ({ scopedId, useStore, useStoreWithoutScope }: ScopedContext) => {
  // scopedId() prefixes the store id to the current scope
  return defineStore(scopedId('vehicles'), () => {

    // useStore() creates a TireStore using the same scope as this VehicleStore instance
    const tireStore = useStore(TireStore)

    // useStoreWithoutScope() creates a TireStore with no prefix (an un-scoped version of the TireStore)
    // this would be the same as useTireStore() in a normal Pinia store
    const tireStoreWithoutScope = useStoreWithoutScope(TireStore)

    // ...
  })
}
```

### Setting Scope Within Components

```vue

<script setup lang="ts">
	import { useStore, setStoreScope } from 'pinia-scope'
	import { VehicleStore } from 'vehicle-store.ts'

	// uses scope of a parent component if set
	// if not set the default scope is '' (empty string) aka un-scoped
	const parentScopedVehicleStore = useStore(VehicleStore)

	// set scope for this component and its children
	setStoreScope('order-preview')

	// uses 'order-preview' scope from above
	const vehicleStore = useStore(VehicleStore)
	vehicleStore.$id // 'order-preview-vehicles'
</script>
```

#### PiniaScopeProvider Component

Scope can also be set via the `PiniaScopeProvider` component.

**Note:**
Stores are only instantiated once when a component is mounted.
The value of a store variable (`const vehicleStore = useStore(VehicleStore)`) cannot be reactive and therefore cannot
change after mounting the component.

To conditionally change the scope of a component, you can mount/unmount components with different scope using `v-if=""`
and the  `PiniaScopeProvider` component.

```vue

<script setup lang="ts">
  import { PiniaScopeProvider } from 'pinia-scope'
  import { defineProps } from 'vue'

  const { useScopeA } = defineProps({
    useScopeA: Boolean
  })
</script>
<template>
  <PiniaScopeProvider v-if="useScopeA" scope="scope-a">
    <div>Scope A</div>
  </PiniaScopeProvider>

  <PiniaScopeProvider v-else scope="scope-b">
    <div>Scope B</div>
  </PiniaScopeProvider>
</template>
```

### Scope Options

After a scope is created, its options cannot be changed.

| option           | default | description                                                                                                                                                                                                                                                                                                                                                                 |
|:-----------------|:--------|:----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `autoDispose`    | `true`  | If true, when there are no longer any mounted components using a scope, [store.\$dispose()](https://pinia.vuejs.org/api/pinia/interfaces/StoreWithState.html#-dispose-) will be called on all stores in the scope. Note: store.$dispose() does not delete the state data and the data will be re-used if the scope is created again later. Use `autoClearState` to do that. |
| `autoClearState` | `true`  | If true, when there are no longer any mounted components using a scope, `delete pinia.state.value[store.$id]` will be called on all stores in the scope.<br/>                                                                                                                                                                                                               |

##### Setting Store Option Defaults

You can set the default options for a specific scope instead of repeating them.

```ts
// in main.js after attachPiniaScope(pinia)
import { setScopeOptionsDefault } from 'pinia-scope'

setScopeOptionsDefault('my-scope', {
  autoDispose: false,
  autoClearState: false,
})

// you can also lookup the defaults
const defaults = setScopeOptionsDefault('my-scope')
```

#### Setting Scope Options
Scope Options can be se when calling `setStoreScope()`. If an `options` argument is provided, This will override any default scope options.
```ts
import { useStore, getPiniaScopes } from 'pinia-scope'

const storeOptions = {
  autoDispose: false,
  autoClearState: false,
}

setStoreScope('my-scope', storeOptions)
```

### Scoped Store Id Generation

```ts
// by default a scope is prefixed onto a store id with the following function:
const generateScopedStoreId = (scope: string, id: string) => `${scope}-${id}`
// example:
const vehicleStore = useStoreWithScope(VehicleStore, 'my-scope')
vehicleStore.$id // 'my-scope-vehicles'
```

#### Custom Scoped Store Id Generation

```ts
import { setPiniaScopeNameGenerator } from 'pinia-scope'

// scoped store id generation can be customized
setPiniaScopeNameGenerator((scope: string, id: string) => `[${scope}]~~[${id}]`)
// example
const vehicleStore = useStoreWithScope(VehicleStore, 'my-scope')
vehicleStore.$id // '[my-scope]~~[vehicles]'
```

## API

All API methods will work inside a vue component or a context where [getActivePinia()](https://pinia.vuejs.org/api/pinia/functions/getActivePinia.html#getActivePinia-) will return a result.

### `useStore()`

Returns a scoped store.
```ts
import { useStore } from 'pinia-scope'
import { VehicleStore } from 'vehicle-store.ts'

const vehicleStore = useStore(VehicleStore)
```

### `useStoreWithoutScope()`

- Equivalent to:
    - `useVehicleStore()` (normal a pinia store)
    - `useStoreWithScope(VehicleStore, '')`

Returns an un-scoped version of a store.
```ts
import { useStoreWithoutScope } from 'pinia-scope'

const vehicleStore = useStoreWithoutScope(VehicleStore)
```

### `getComponentStoreScope()`

Returns the current scope or an empty string if no scope is set. Useful when debugging component scopes.
```ts
import { getComponentStoreScope } from 'pinia-scope'

console.log(getComponentStoreScope())
```

### `getStoreWithScope()`

Returns a scoped version of a store. Useful when writing tests.
```ts
import { getStoreWithScope } from 'pinia-scope'

const vehicleStore = getStoreWithScope(VehicleStore, 'my-scope')
```

### `disposeOfPiniaScope()`

Equivalent behavior to `autoDispose = true` and `autoClearState = false` scope options.
If you want to `store.$dispose()` a scope's stores manually and **never** clear its state,
set `autoDispose = false` and call `disposeOfPiniaScope()`.
```ts
import { disposeOfPiniaScope } from 'pinia-scope'

disposeOfPiniaScope('my-scope')
```

### `disposeAndClearStateOfPiniaScope()`

Equivalent to `autoDispose = true` and `autoClearState = true` scope options.
If you want to `store.$dispose()` a scope's stores manually and clear its state,
set `autoDispose = false` and `autoClearState = false` call `disposeAndClearStateOfPiniaScope()`.
```ts
import { disposeAndClearStateOfPiniaScope } from 'pinia-scope'

disposeAndClearStateOfPiniaScope('my-scope')
```

## Testing / Use Outside Components

To use pinia scope functions outside a component, you can manually set the active pinia instance. The same way you would for normal pinia stores.
```ts
import { useStore } from 'pinia-scope'
import { VehicleStore } from 'vehicle-store.ts'
import { createPinia, setActivePinia } from 'pinia'
import { attachPiniaScope } from './pinia-scope'

const pinia = createPinia()

setActivePinia(pinia)
attachPiniaScope(pinia)

const vehicleStore = useStore(VehicleStore)
```

## Examples

- [Vehicle List Example](examples/vehicle-editor)

## Building

`$ pnpm install`
`$ pnpm run build`

## Testing

`$ pnpm run test`
`$ pnpm run test:mutation`

## References

Partly Inspired by: [https://github.com/ccqgithub/pinia-di](https://github.com/ccqgithub/pinia-di)

## Releases Automation

- update `package.json` file version (example: `1.0.99`)
- manually create a github release with a tag matching the `package.json` version prefixed with `v` (example: `v1.0.99`)
- npm should be updated automatically
