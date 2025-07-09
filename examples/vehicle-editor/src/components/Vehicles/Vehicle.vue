<script setup lang="ts">
import { getStoreScope, useStore } from 'pinia-scope'
import { VehicleStore } from '../../store/vehicle-store.ts'
import { computed } from 'vue'
import VehicleEngineEdit from './VehicleEngineEdit.vue'
import VehicleTireEdit from './VehicleTireEdit.vue'
import SpeedProgress from './SpeedProgress.vue'
import CurrentScopeBadge from '../CurrentScopeBadge.vue'

const vehicleStore = useStore(VehicleStore)

const { vehicleId } = defineProps({
	vehicleId: {
		type: Number,
		required: true,
	},
})

const vehicle = computed(() => vehicleStore.get(vehicleId))
const info = computed(() => vehicleStore.getInfo(vehicleId))
</script>
<template>
	<div class="card my-2">
		<div class="card-header">
			<strong>Vehicle:</strong>
			{{ info.name }}
			<CurrentScopeBadge/>
		</div>
		<div class="card-body">
			<div class="row">
				<div class="col-auto">
					<table class="table w-auto">
						<thead>
						<tr>
							<th colspan="3">Data</th>
						</tr>
						</thead>
						<tbody>
						<tr>
							<th>ID</th>
							<td>{{ info.id }}</td>
							<td></td>
						</tr>
						<tr>
							<th>Name</th>
							<td>
								<input type="text" class="form-control" v-model="vehicle.name">
							</td>
							<td></td>
						</tr>
						</tbody>
					</table>
				</div>
				<div class="col-auto">
					<table class="table w-auto">
						<thead>
						<tr>
							<th></th>
							<th></th>
							<th>Speed</th>
						</tr>
						</thead>
						<tbody>
						<tr>
							<th>Engine</th>
							<td>
								<VehicleEngineEdit v-model="vehicle.engine_id" />
							</td>
							<td class="font-monospace text-end">+{{ info.engine.speed }}</td>
						</tr>
						<tr>
							<th>Tire</th>
							<td>
								<VehicleTireEdit v-model="vehicle.tire_id" />
							</td>
							<td class="font-monospace text-end">+{{ info.tire.speed }}</td>
						</tr>
						</tbody>
						<tfoot>
						<tr>
							<th>Total</th>
							<th>
								<SpeedProgress :current="info.total_speed" :max="vehicleStore.maxSpeed" />
							</th>
							<th class="font-monospace text-end">{{ info.total_speed }}</th>
						</tr>
						</tfoot>
					</table>
				</div>
			</div>
		</div>
		<div class="card-footer">
			<button class="btn btn-danger" @click="vehicleStore.remove(vehicleId)">Delete</button>
		</div>
	</div>
</template>
