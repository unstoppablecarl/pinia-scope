<script setup lang="ts">
import { getComponentScope } from 'pinia-scope'

const scope = getComponentScope()
</script>
<template>
	<span class="badge text-bg-secondary">
		<template v-if="scope">
			Scope: {{ scope }}
		</template>
		<template v-else>
			Un-Scoped
		</template>
	</span>
</template>
