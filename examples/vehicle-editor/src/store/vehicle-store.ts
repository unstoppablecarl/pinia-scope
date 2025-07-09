import { defineStore } from 'pinia'
import { type ScopedContext } from 'pinia-scope'
import { computed, ref } from 'vue'
import { type Tire, TireStore } from './tire-store.ts'
import { type Engine, EngineStore } from './engine-store.ts'

export type Vehicle = VehicleAdd & {
  id: number,
}

export type VehicleAdd = {
  name: string;
  tire_id: string;
  engine_id: string;
}

export type VehicleInfo = Vehicle & {
  engine: Engine,
  tire: Tire,
  total_speed: number,
}

export function VehicleStore({ scopedId, useStore }: ScopedContext) {
  return defineStore(scopedId('vehicles'), () => {

    const tireStore = useStore(TireStore)
    const engineStore = useStore(EngineStore)

    const vehicles = ref<Vehicle[]>([])
    const vehiclesIdIncrement = ref<number>(1)

    const maxSpeed = computed(() => {
      return tireStore.maxSpeed + engineStore.maxSpeed
    })

    function get(id: number): Vehicle {
      const vehicle = vehicles.value.find((vehicle) => vehicle.id === id)
      if (!vehicle) {
        throw new Error(`Vehicle ${id} not found`)
      }
      return vehicle
    }

    function getInfo(id: number): VehicleInfo {
      const vehicle = get(id)
      const tire = tireStore.get(vehicle.tire_id)
      const engine = engineStore.get(vehicle.engine_id)
      return {
        ...vehicle,
        tire,
        engine,
        total_speed: tire.speed + engine.speed,
      }
    }

    function remove(vehicleId: number) {
      const index = vehicles.value.findIndex((vehicle: Vehicle) => vehicle.id === vehicleId)
      if (index !== -1) {
        vehicles.value.splice(index, 1)
      }
    }

    function add(options: VehicleAdd | null = null) {
      const newId = vehiclesIdIncrement.value++

      let input = {
        name: 'new vehicle ' + newId,
        tire_id: tireStore.defaultTire.id,
        engine_id: engineStore.defaultEngine.id,
      }
      if (options) {
        input = Object.assign(input, options)
      }

      vehicles.value.push({
        id: newId,
        ...input,
      })
    }

    return {
      vehicles,
      vehiclesIdIncrement,

      maxSpeed,

      add,
      remove,
      get,
      getInfo,
    }
  })
}
