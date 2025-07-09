<script setup lang="ts">
import Vehicles from './components/Vehicles.vue'
import DraftVehicles from './components/DraftVehicles.vue'
import { ref } from 'vue'

const draftVehicles = ref(false)
</script>
<template>
	<div class="container">
		<h4>Vehicle Editor</h4>
		<Vehicles title="Vehicle List" />

		<template v-if="!draftVehicles">
			<button class="btn btn-secondary" @click="draftVehicles = true">Draft Vehicles</button>
		</template>
		<template v-else>
			<DraftVehicles v-model="draftVehicles" />
		</template>
	</div>
</template>
