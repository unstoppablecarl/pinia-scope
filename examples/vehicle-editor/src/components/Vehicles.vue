<script setup lang="ts">
import { getStoreScope, useStore } from 'pinia-scope'
import { VehicleStore } from '../store/vehicle-store.ts'
import { storeToRefs } from 'pinia'
import Vehicle from './Vehicles/Vehicle.vue'

const vehicleStore = useStore(VehicleStore)
const { vehicles } = storeToRefs(vehicleStore)

const { title } = defineProps({
	title: {
		type: String,
		required: true,
	},
})

const scope = getStoreScope()
</script>
<template>
	<div class="card my-1">
		<div class="card-header">
			<strong>{{ title }}</strong>
			&nbsp;
			<span class="badge text-bg-secondary">
				<template v-if="scope">
					Scope: {{ scope }}
				</template>
				<template v-else>
					Un-Scoped
				</template>
			</span>
		</div>
		<div class="card-body">
			<Vehicle
				v-for="item in vehicles"
				:vehicle-id="item.id"
			/>
		</div>
		<div class="card-footer">
			<button class="btn btn-primary" @click="vehicleStore.add()">Add Vehicle</button>
			<slot name="controls"></slot>
		</div>
	</div>
</template>
