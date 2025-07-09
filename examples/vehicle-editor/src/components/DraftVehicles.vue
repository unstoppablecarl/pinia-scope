<script setup lang="ts">
import { setStoreScope, useStore, useStoreWithoutScope } from 'pinia-scope'
import Vehicles from './Vehicles.vue'
import { VehicleStore } from '../store/vehicle-store.ts'

const visible = defineModel()

setStoreScope('draft')

const draftVehicleStore = useStore(VehicleStore)
const vehicleStore = useStoreWithoutScope(VehicleStore)

function importDraftVehicles() {
	draftVehicleStore.vehicles.forEach(vehicle => {
		vehicleStore.add({
			name: vehicle.name,
			engine_id: vehicle.engine_id,
			tire_id: vehicle.tire_id,
		})
	})

	visible.value = false
}

</script>
<template>
	<Vehicles title="Draft Vehicles">
		<template #controls>
			&nbsp;
			<button class="btn btn-secondary" @click="importDraftVehicles()">Import Draft Vehicles</button>
		</template>
	</Vehicles>
</template>
