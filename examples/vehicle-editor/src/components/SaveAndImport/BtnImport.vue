<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import { StoreScopeProvider } from 'pinia-scope'
import { IMPORT_SCOPE, jsonFileParser, loadSaveFileData } from '../../store/helpers/save-load-data.ts'
import { useVehicleStore } from '../../store/vehicle-store.ts'
import { useEngineStore } from '../../store/engine-store.ts'
import ImportVehicles from './ImportVehiclesModal.vue'

const fileImport = useTemplateRef('file-import')
const visible = ref(false)

const fileImportChange = jsonFileParser((jsonData) => {
	// load file data into import scoped stores
	loadSaveFileData(jsonData, IMPORT_SCOPE)

	visible.value = true
	fileImport.value.value = null
})

const vehicleStore = useVehicleStore.unScoped()
const engineStore = useEngineStore.unScoped()

const importVehicleStore = useVehicleStore(IMPORT_SCOPE)
const importEngineStore = useEngineStore(IMPORT_SCOPE)

function importJsonData(importVehicleIds) {
	importVehicleIds.forEach(id => {
		const vehicle = importVehicleStore.get(id)
		let engine_id = vehicle.engine_id

		// import custom engines when needed
		if (importEngineStore.isCustom(vehicle.engine_id)) {
			const customEngine = importEngineStore.get(vehicle.engine_id)
			// use new engine id
			engine_id = engineStore.addCustomEngine({
				name: customEngine.name,
				speed: customEngine.speed,
			})
		}

		vehicleStore.add({
			name: vehicle.name,
			engine_id,
			tire_id: vehicle.tire_id,
		})
	})
}
</script>
<template>
	<input ref="file-import" type="file" @change="fileImportChange" accept="application/json" hidden>
	<button class="btn btn-primary btn-sm me-1" @click="fileImport.click()">Import</button>

	<StoreScopeProvider :scope="IMPORT_SCOPE">
		<ImportVehicles v-if="visible" @close="visible = false" @import-vehicle-ids="importJsonData($event)"/>
	</StoreScopeProvider>
</template>