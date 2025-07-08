# pinia-scope

Scoped [Pinia](https://pinia.vuejs.org/) Stores for [Vue.js](https://vuejs.org/)

## Installation

`$ npm i unstoppablecarl/pinia-scope`

## Concept
Pinia Scope allows creating dynamically scoped versions of Pinia stores. 
A scope is a string that prefixes one or more Pinia Store ids separating them from their un-scoped version.
After setting the scope of a component, its child components inherit that scope.
This allows dynamic creation and disposal of the data layer in a Vue app.

## Usage

### Defining Stores
Stores created with pinia's `defineStore()` are wrapped in a store creator function.

#### Normal Pinia Store
Store Definition

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

export const VehicleStore = ({ scopedId }: ScopedContext) => {
  return defineStore(scopedId('vehicles'), () => {
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

export const VehicleStore = ({ scopedId,  useStore, useStoreWithoutScope}: ScopedContext) => {
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

  // uses scope of parent (if set)
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
The value of a store variable cannot be swapped after mounting the component, but a conditional can be used to swap the `PiniaScopeProvider` component.

```vue

<script setup lang="ts">
  import { PiniaScopeProvider } from 'pinia-scope'
  import { defineProps } from 'vue'
  
  const {useScopeA} = defineProps({
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

#### Cleanup
By default a scope is automatically disposed of and cleaned up when there are no longer any mounted components using it.
```ts
import { useStore, getPiniaScopes } from 'pinia-scope'

// to disable auto cleanup use the `autoDispose` option.
setStoreScope('my-scope', {autoDispose: false})

// you can manually dispose of a scope using `getPiniaScopes()`
getPiniaScopes().dispose('my-scope')
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

### `useStoreWithoutScope()`
```ts
import { useStoreWithoutScope } from 'pinia-scope'

// works inside and outside vue components
// gets or creates an un-scoped version of a store
// equivalent to useStoreWithScope(VehicleStore, '')
const vehicleStore = useStoreWithoutScope(VehicleStore)
```

### `getStoreScope()`
```ts
import { getStoreScope } from 'pinia-scope'

// Useful when debugging component scopes
// only works inside a vue component
// returns the current scope or an empty string if no scope is set
console.log(
  getStoreScope()
)
```

### `getStoreWithScope()`
```ts
import { getStoreWithScope } from 'pinia-scope'

// Useful when writing tests
// works inside and outside vue components
// gets or creates a scoped version of a store
const vehicleStore = getStoreWithScope(VehicleStore, 'my-scope')
```

## References

Inspired by: [https://github.com/ccqgithub/pinia-di](https://github.com/ccqgithub/pinia-di)

## Releases Automation
- update `package.json` file version (example: `1.0.99`)
- manually create a github release with a tag matching the `package.json` version prefixed with `v` (example: `v1.0.99`)
- npm should be updated automatically
