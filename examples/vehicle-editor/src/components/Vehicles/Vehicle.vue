<script setup lang="ts">

import { useStore } from 'pinia-scope'
import { VehicleStore } from '../../store/vehicle-store.ts'
import { computed } from 'vue'

const vehicleStore = useStore(VehicleStore)

const {vehicleId} = defineProps({
	vehicleId: Number
})

const tableData = computed(() => {

	const vehicle = vehicleStore.find
	return {
		ID:
	}
})

</script>
<template>

	<table class="table w-auto">
		<tbody>
			<tr>
				<th>ID</th>
				<td>{{vehicleId}}</td>
			</tr>
		</tbody>
	</table>


</template>
