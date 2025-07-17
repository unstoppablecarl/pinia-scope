<script setup lang="ts">
import { getInjectedScope } from 'pinia-scope'

const scope = getInjectedScope()
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
