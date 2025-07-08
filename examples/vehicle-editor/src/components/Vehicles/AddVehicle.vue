<script setup lang="ts">
import { useStore } from 'pinia-scope'
import { VehicleStore } from '../../store/vehicle-store.ts'

const vehicleStore = useStore(VehicleStore)

</script>
<template>

	<button class="btn btn-primary" @click="vehicleStore.add()">Add Vehicle</button>
</template>
