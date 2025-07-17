import { computed } from 'vue'
import { defineScopedStore } from '../../../../src'

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
    speed: 5,
  },
}

export const useTireStore = defineScopedStore('tires', ({}) => {
  const tires = computed<Tire[]>(() => Object.values(TIRE_DATA))

  const defaultTire = computed<Tire>(() => TIRE_DATA[TIRE_ROAD])

  const maxSpeed = computed(() => {
    const tireSpeeds = tires.value.map(tire => tire.speed)
    return Math.max(...tireSpeeds)
  })

  function get(id: string): Tire {
    if (id in TIRE_DATA) {
      return TIRE_DATA[id]
    }

    throw new Error(`Tire ${id} not found`)
  }

  return {
    defaultTire,
    tires,
    maxSpeed,
    get,
  }
})
