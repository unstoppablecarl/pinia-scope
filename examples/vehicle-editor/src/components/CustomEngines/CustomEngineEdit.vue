<script setup lang="ts">
import { computed } from 'vue'
import CurrentScopeBadge from '../CurrentScopeBadge.vue'
import { useEngineStore } from '../../store/engine-store.ts'

const engineStore = useEngineStore()

const { engineId } = defineProps({
	engineId: {
		type: String,
		required: true,
	},
})

const engine = computed(() => engineStore.get(engineId))
const vehiclesUsingEngine = computed(() => engineStore.getVehiclesWithEngine(engineId))
const engineIsUsed = computed(() => engineStore.engineIsUsed(engineId))

</script>
<template>
	<div class="card my-2">
		<div class="card-header">
			<strong>
				Custom Engine
			</strong>

			&nbsp;
			<CurrentScopeBadge />

			{{ engine.name }}
		</div>
		<div class="card-body">
			<div class="form-floating mb-3">
				<input class="form-control" :id="`${engineId}-engine-name`" v-model="engine.name">
				<label for="engine-name">Name</label>
			</div>

			<div class="form-floating mb-3">
				<input class="form-control" id="engine-name" type="number" v-model="engine.speed">
				<label :for="`${engineId}-engine-name`">Speed</label>
			</div>
		</div>
		<div class="card-footer">
			<button
				:class="`btn btn-danger${engineIsUsed ? ' disabled' : ''}`"
				@click="engineStore.removeCustomEngine(engine.id)"
			>
				Delete
			</button>

			<template v-if="engineIsUsed">
				<strong>
					Cannot Delete while in use by Vehicles:
				</strong>
				{{ vehiclesUsingEngine.map(engine => engine.name).join(', ') }}

			</template>

		</div>
	</div>

</template>