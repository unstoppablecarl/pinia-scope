<script setup lang="ts">
import { useEngineStore } from '../../store/engine-store.ts'

const engineStore = useEngineStore()
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