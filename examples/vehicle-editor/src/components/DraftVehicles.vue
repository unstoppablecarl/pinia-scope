<script setup lang="ts">
import { setComponentScope } from 'pinia-scope'
import Vehicles from './Vehicles.vue'
import { useVehicleStore } from '../store/vehicle-store.ts'
import { useEngineStore } from '../store/engine-store.ts'

const visible = defineModel()

// create a scope for the draft vehicles separate from the un-scoped stores
setComponentScope('draft')

const draftVehicleStore = useVehicleStore()
const draftEngineStore = useEngineStore()

const vehicleStore = useVehicleStore.unScoped()
const engineStore = useEngineStore.unScoped()

// copy data from the draft store to the app store
function importDraftVehicles() {

	draftEngineStore.customEngines.forEach(engine => {
		engineStore.addCustomEngine({
			name: engine.name,
			speed: engine.speed,
		})
	})

	draftVehicleStore.vehicles.forEach(vehicle => {
		vehicleStore.add({
			name: vehicle.name,
			engine_id: vehicle.engine_id,
			tire_id: vehicle.tire_id,
		})
	})

	// trigger unmounting this component
	// causing the 'draft' scope to remove and cleanup
	visible.value = false
}
</script>
<template>
	<Vehicles title="Draft Vehicles">
		<template #controls>
			&nbsp;
			<button
				class="btn btn-secondary"
				v-if="draftVehicleStore.vehicles.length"
				@click="importDraftVehicles()"
			>
				Import Draft Vehicles
			</button>
		</template>
	</Vehicles>
</template>
