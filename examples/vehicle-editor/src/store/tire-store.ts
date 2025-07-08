import { defineStore } from 'pinia'
import { type ScopedContext } from 'pinia-scope'
import { computed } from 'vue'

export type Tire = {
  id: string;
  name: string;
  speed: number;
}

const TIRE_ROAD = 'TIRE_ROAD'
const TIRE_PERFORMANCE = 'TIRE_PERFORMANCE'
const TIRE_OFF_ROAD = 'TIRE_OFF_ROAD'

const TIRE_DATA: { [key: string]: Tire } = {
  [TIRE_ROAD]: {
    id: TIRE_ROAD,
    name: 'Road',
    speed: 4,
  },
  [TIRE_PERFORMANCE]: {
    id: TIRE_PERFORMANCE,
    name: 'Performance',
    speed: 8,
  },
  [TIRE_OFF_ROAD]: {
    id: TIRE_OFF_ROAD,
    name: 'Off-Road',
    speed: 5
  },
}

export function TireStore({ scopedId }: ScopedContext) {
  return defineStore(scopedId('tires'), () => {
    const tires = computed<Tire[]>(() => Object.values(TIRE_DATA))

    const default_tire = computed<Tire>(() => TIRE_DATA[TIRE_ROAD])

    function get(id: string): Tire {
      return TIRE_DATA[id]
    }

    return {
      tires,
      default_tire,
      get,
    }
  })
}
