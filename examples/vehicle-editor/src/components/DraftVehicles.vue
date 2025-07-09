<script setup lang="ts">
import { setStoreScope, useStore, useStoreWithoutScope } from 'pinia-scope'
import Vehicles from './Vehicles.vue'
import { VehicleStore } from '../store/vehicle-store.ts'
import { EngineStore } from '../store/engine-store.ts'

const visible = defineModel()

// create a scope for the draft vehicles separate from the un-scoped stores
setStoreScope('draft')

const draftVehicleStore = useStore(VehicleStore)
const draftEngineStore = useStore(EngineStore)

const vehicleStore = useStoreWithoutScope(VehicleStore)
const engineStore = useStoreWithoutScope(EngineStore)

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
