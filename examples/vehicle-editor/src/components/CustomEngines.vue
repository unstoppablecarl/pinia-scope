<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useEngineStore } from '../store/engine-store.ts'
import CustomEngineEdit from './CustomEngines/CustomEngineEdit.vue'
import CurrentScopeBadge from './CurrentScopeBadge.vue'

const engineStore = useEngineStore()
const { customEngines } = storeToRefs(engineStore)
</script>
<template>
	<div class="card my-1">
		<div class="card-header">
			<strong>Custom Engine List</strong>
			&nbsp;
			<CurrentScopeBadge />
		</div>
		<div class="card-body">
			<CustomEngineEdit
				v-for="item in customEngines"
				:engine-id="item.id"
			/>
		</div>
		<div class="card-footer">
			<button class="btn btn-primary" @click="engineStore.addCustomEngine()">Add Custom Engine</button>
		</div>
	</div>
</template>
