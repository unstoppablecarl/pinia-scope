<script setup lang="ts">
import Vehicles from './components/Vehicles.vue'
import DraftVehicles from './components/DraftVehicles.vue'
import { ref } from 'vue'
import BtnSave from './components/SaveAndImport/BtnSave.vue'
import BtnImport from './components/SaveAndImport/BtnImport.vue'

const draftVehicles = ref(false)
</script>
<template>
	<div class="container">
		<h4 class="my-2">Vehicle Editor</h4>
		<div>
			<BtnSave />
			<BtnImport />
		</div>
		<Vehicles title="Vehicle List" />
		<button
			class="btn btn-secondary"
			v-if="!draftVehicles"
			@click="draftVehicles = true"
		>
			Draft New Vehicles
		</button>
		<DraftVehicles v-else v-model="draftVehicles" />
	</div>
</template>
