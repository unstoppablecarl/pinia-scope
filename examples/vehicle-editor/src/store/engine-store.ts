import { defineScopedStore } from 'pinia-scope'
import { computed, ref } from 'vue'
import { useVehicleStore, type Vehicle } from './vehicle-store.ts'

export type Engine = EngineAdd & {
  id: string;

}

export type EngineAdd = {
  name: string;
  speed: number;
}

const ENGINE_ECONOMY = 'ENGINE_ECONOMY'
const ENGINE_PERFORMANCE = 'ENGINE_PERFORMANCE'

const ENGINE_DATA: { [key: string]: Engine } = {
  [ENGINE_ECONOMY]: {
    id: ENGINE_ECONOMY,
    name: 'Economy',
    speed: 10,
  },
  [ENGINE_PERFORMANCE]: {
    id: ENGINE_PERFORMANCE,
    name: 'Performance',
    speed: 20,
  },
}

export const useEngineStore = defineScopedStore('engines', ({scope}) => {

  const vehicleStore = useVehicleStore.scoped(scope)

  const customEngines = ref<Engine[]>([])
  const customEnginesIdIncrement = ref<number>(1)

  const engines = computed<Engine[]>(() => {
    return [
      ...customEngines.value,
      ...Object.values(ENGINE_DATA),
    ]
  })

  const defaultEngine = computed<Engine>(() => ENGINE_DATA[ENGINE_ECONOMY])

  const maxSpeed = computed(() => {
    const engineSpeeds = engines.value.map(engine => engine.speed)
    return Math.max(...engineSpeeds)
  })

  function addCustomEngine(options: EngineAdd | null = null) {
    let increment = customEnginesIdIncrement.value++
    const newId = 'CUSTOM_ENGINE_' + increment

    let input = {
      name: 'new custom engine ' + increment,
      speed: 99,
    }
    if (options) {
      input = Object.assign(input, options)
    }

    customEngines.value.push({
      id: newId,
      ...input,
    })
  }

  function removeCustomEngine(engineId: string) {

    if (ENGINE_DATA[engineId]) {
      throw new Error(`Cannot remove Non-Custom Engine ${engineId}`)
    }

    if (engineIsUsed(engineId)) {
      throw new Error(`Cannot remove engine ${engineId} while in use`)
    }

    const index = customEngines.value.findIndex((engine: Engine) => engine.id === engineId)
    if (index !== -1) {
      customEngines.value.splice(index, 1)
    }
  }

  function get(id: string): Engine {
    if (id in ENGINE_DATA) {
      return ENGINE_DATA[id]
    }
    const engine = engines.value.find((engine) => engine.id === id)
    if (!engine) {
      throw new Error(`Engine ${id} not found`)
    }
    return engine
  }

  function engineIsUsed(engineId: string): boolean {
    return !!getVehiclesWithEngine(engineId).length
  }

  function getVehiclesWithEngine(engineId: string): Vehicle[] {
    return vehicleStore.vehicles.filter(vehicle => vehicle.engine_id === engineId)
  }

  return {
    defaultEngine,
    engines,
    maxSpeed,
    customEngines,
    engineIsUsed,

    getVehiclesWithEngine,
    addCustomEngine,
    removeCustomEngine,
    get,
  }
})

