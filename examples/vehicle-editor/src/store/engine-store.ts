import { defineStore } from 'pinia'
import { type ScopedContext } from 'pinia-scope'
import { computed } from 'vue'

export type Engine = {
  id: string;
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

export function EngineStore({ scopedId }: ScopedContext) {
  return defineStore(scopedId('engines'), () => {
    const engines = computed<Engine[]>(() => Object.values(ENGINE_DATA))

    const default_engine = computed<Engine>(() => ENGINE_DATA[ENGINE_ECONOMY])

    function get(id: string): Engine {
      return ENGINE_DATA[id]
    }

    return {
      engines,
      default_engine,
      get,
    }
  })
}
