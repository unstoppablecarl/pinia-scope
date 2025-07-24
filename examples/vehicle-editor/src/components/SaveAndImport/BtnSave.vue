<script setup>
import fileSaver from 'file-saver'
import { makeSaveFileData } from '../../store/helpers/save-load-data.ts'

function saveFile() {

	const fileName = 'vehicle-list'
	const data = makeSaveFileData()

	let payload = JSON.stringify(data)
	let blob = new Blob([payload], { type: 'text/plain;charset=utf-8' })
	fileSaver.saveAs(blob, `${fileName}.json`)
}
</script>
<template>
	<button class="btn btn-primary btn-sm me-1" @click="saveFile()">Save</button>
</template>