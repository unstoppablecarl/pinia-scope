<script setup lang="ts">
import { useVehicleStore } from '../store/vehicle-store.ts'
import { storeToRefs } from 'pinia'
import Vehicle from './Vehicles/Vehicle.vue'
import CustomEngines from './CustomEngines.vue'
import CurrentScopeBadge from './CurrentScopeBadge.vue'

const vehicleStore = useVehicleStore()
const { vehicles, maxSpeed } = storeToRefs(vehicleStore)

const { title } = defineProps({
	title: {
		type: String,
		required: true,
	},
})
</script>
<template>
	<div class="card my-1">
		<div class="card-header">
			<strong>{{ title }}</strong>
			&nbsp;
			<CurrentScopeBadge />
			&nbsp;
			<span class="fw-medium">
				Max Possible Speed:
			</span>

			{{ maxSpeed }}
		</div>
		<div class="card-body">
			<div class="row mx-0">
				<div class="col-md-8">
					<Vehicle
						v-for="item in vehicles"
						:vehicle-id="item.id"
					/>
				</div>
				<div class="col-md-4">
					<CustomEngines />
				</div>
			</div>
		</div>
		<div class="card-footer">
			<button class="btn btn-primary" @click="vehicleStore.add()">Add Vehicle</button>
			<slot name="controls"></slot>
		</div>
	</div>
</template>
