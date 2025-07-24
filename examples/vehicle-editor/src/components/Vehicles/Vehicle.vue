<script setup lang="ts">
import { useVehicleStore } from '../../store/vehicle-store.ts'
import { computed } from 'vue'
import VehicleEngineEdit from './VehicleEngineEdit.vue'
import VehicleTireEdit from './VehicleTireEdit.vue'
import SpeedProgress from './SpeedProgress.vue'
import CurrentScopeBadge from '../CurrentScopeBadge.vue'

const vehicleStore = useVehicleStore()

const { vehicleId, readonly } = defineProps({
	vehicleId: {
		type: Number,
		required: true,
	},
	readonly: {
		type: Boolean,
		default: false,
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
			<CurrentScopeBadge />
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
							<th>
								<div class="col-form-label">
									ID
								</div>
							</th>
							<td>
								<div class="col-form-label">
									{{ info.id }}
								</div>
							</td>
							<td></td>
						</tr>
						<tr>
							<th class="">
								<div class="col-form-label">Name</div>
							</th>
							<td>
								<input type="text" class="form-control" v-model="vehicle.name" v-if='!readonly' />
								<template v-else>{{ vehicle.name }}</template>
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
							<th>
								<div class="col-form-label">
									Engine
								</div>
							</th>
							<td>
								<template v-if="readonly">
									{{ info.engine.name }}
								</template>
								<VehicleEngineEdit v-else v-model="vehicle.engine_id" />
							</td>
							<td class="font-monospace text-end">
								<div class="col-form-label">
									+{{ info.engine.speed }}
								</div>
							</td>
						</tr>
						<tr>
							<th>
								<div class="col-form-label">
									Tire
								</div>
							</th>
							<td>
								<template v-if="readonly">
									{{ info.tire.name }}
								</template>
								<VehicleTireEdit v-else v-model="vehicle.tire_id" />
							</td>
							<td class="font-monospace text-end">
								<div class="col-form-label">
									+{{ info.tire.speed }}
								</div>
							</td>
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
			<slot name="footer"></slot>
		</div>
	</div>
</template>
