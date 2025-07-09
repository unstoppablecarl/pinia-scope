<script setup lang="ts">
import { useStore } from 'pinia-scope'
import { TireStore } from '../../store/tire-store.ts'

const tireStore = useStore(TireStore)
const model = defineModel()
</script>
<template>
	<select class="form-select" v-model="model">
		<option
			v-for="tire in tireStore.tires"
			:value="tire.id">
			{{ tire.name }} (+{{ tire.speed }})
		</option>
	</select>
</template>