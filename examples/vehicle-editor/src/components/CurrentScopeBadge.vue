<script setup lang="ts">
import { getStoreScope } from 'pinia-scope'

const scope = getStoreScope()
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
