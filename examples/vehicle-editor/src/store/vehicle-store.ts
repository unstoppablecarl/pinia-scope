import { defineStore } from 'pinia'
import { type ScopedContext } from 'pinia-scope'
import { ref } from 'vue'
import { type Tire, TireStore } from './tire-store.ts'
import { type Engine, EngineStore } from './engine-store.ts'

type Vehicle = {
  id: number,
  name: string;
  tire_id: string;
  engine_id: string;
}

type VehicleInfo = Vehicle & {
  engine: Engine,
  tire: Tire,
  total_speed: number,
}

export function VehicleStore({ scopedId, useStore }: ScopedContext) {
  return defineStore(scopedId('vehicles'), () => {

    const tireStore = useStore(TireStore)
    const engineStore = useStore(EngineStore)

    const vehicles = ref<Vehicle[]>([])
    const vehicles_id_increment = ref<number>(0)

    function getInfo(id: number): VehicleInfo {
      const vehicle = vehicles.value.find((vehicle) => vehicle.id === id)
      if (!vehicle) {
        throw new Error(`Vehicle ${id} not found`)
      }

      let tire = tireStore.get(vehicle.tire_id)
      let engine = tireStore.get(vehicle.engine_id)
      return {
        ...vehicle,
        tire,
        engine,
        total_speed: tire.speed + engine.speed,
      }
    }

    function add() {
      const newId = vehicles_id_increment.value++
      vehicles.value.push({
        id: newId,
        name: 'new vehicle ' + newId,
        tire_id: tireStore.default_tire.id,
        engine_id: engineStore.default_engine.id,
      })
    }

    return {
      vehicles,
      vehicles_id_increment,
      add,

      getInfo,
    }
  })
}
