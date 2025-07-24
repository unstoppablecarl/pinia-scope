<script setup lang="ts">
import { Modal } from 'bootstrap'
import { onMounted, ref } from 'vue'
import { useVehicleStore } from '../../store/vehicle-store.ts'
import Vehicle from '../Vehicles/Vehicle.vue'

// using parent component scope
// in this example it is IMPORT_SCOPE
const vehicleStore = useVehicleStore()

const emit = defineEmits(['close', 'importVehicleIds'])
const selectedVehicleIds = ref(new Set<number>())

let modal

onMounted(() => {
	const modalEL = document.getElementById('import-modal-id')
	// close after animation
	modalEL.addEventListener('hidden.bs.modal', event => {
		emit('close')
	})

	modal = new Modal(modalEL)
	modal.show()
})

function selectVehicleIds() {
	emit('importVehicleIds', [...selectedVehicleIds.value.values()])
	modal.hide()
}
</script>
<template>
	<div class="modal fade" id="import-modal-id" tabindex="-1">
		<div class="modal-dialog modal-lg">
			<div class="modal-content">
				<div class="modal-header">
					<h5 class="modal-title">Select Vehicles To Import</h5>
					<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
				</div>
				<div class="modal-body">
					<Vehicle v-for="item in vehicleStore.vehicles" :vehicle-id="item.id" :readonly="true">
						<template #footer>
							<button
								type="button"
								class="btn btn-primary"
								v-show="!selectedVehicleIds.has(item.id)"
								@click="selectedVehicleIds.add(item.id)"
							>
								Select
							</button>
							<button
								type="button"
								class="btn btn-danger"
								v-show="selectedVehicleIds.has(item.id)"
								@click="selectedVehicleIds.delete(item.id)"
							>
								Remove
							</button>

						</template>
					</Vehicle>
				</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-primary" @click="selectVehicleIds">Import Vehicles</button>
				</div>
			</div>
		</div>
	</div>
</template>