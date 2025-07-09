<script setup lang="ts">
import { useStore } from 'pinia-scope'
import { EngineStore } from '../../store/engine-store.ts'

const engineStore = useStore(EngineStore)
const model = defineModel()
</script>
<template>
	<select class="form-select" v-model="model">
		<option
			v-for="engine in engineStore.engines"
			:value="engine.id">
			{{ engine.name }} (+{{ engine.speed }})
		</option>
	</select>
</template>