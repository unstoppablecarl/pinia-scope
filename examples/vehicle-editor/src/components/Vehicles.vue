<script setup lang="ts">

import { useStore } from 'pinia-scope'
import { VehicleStore } from '../store/vehicle-store.ts'
import Vehicle from './Vehicles/Vehicle.vue'
import AddVehicle from './Vehicles/AddVehicle.vue'

const vehicleStore = useStore(VehicleStore)

</script>
<template>
	<Vehicle
		v-for="item in vehicleStore.vehicles"
		:vehicle-id="item.id"
	/>
	<AddVehicle/>

</template>
