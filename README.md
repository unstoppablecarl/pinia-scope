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
  import { setStoreScope } from 'pinia-scope'
  import { useStore } from 'pinia-scope'
  import { VehicleStore } from 'vehicle-store.ts'

  // set scope for this component and its children
  setStoreScope('order-preview')

  const vehicleStore = useStore(VehicleStore)
  vehicleStore.$id // 'order-preview-vehicles'
</script>
```


## References

Inspired by: [https://github.com/ccqgithub/pinia-di](https://github.com/ccqgithub/pinia-di)

## Releases Automation
- update `package.json` file version (example: `1.0.99`)
- manually create a github release with a tag matching the `package.json` version prefixed with `v` (example: `v1.0.99`)
- npm should be updated automatically
