<script setup lang="ts">
import { computed } from 'vue'

const {current, max} = defineProps({
	current: {
		type: Number,
		required: true,
	},
	max: {
		type: Number,
		required: true,
	}
})

const percent = computed(() => (current / max) * 100)
</script>
<template>
	<div class="progress" role="progressbar" aria-label="Basic example" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">
		<div class="progress-bar" :style="`width: ${percent}%`">{{ current}}</div>
	</div>
</template>