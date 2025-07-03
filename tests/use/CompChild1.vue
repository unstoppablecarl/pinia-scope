<script setup lang="ts">
import { setStoreScope, useStore } from '../../src'
import {
  Child1NameStore,
  Child2NameStore,
  NameStore,
} from '../helpers/test-stores'
import { watch } from 'vue'
import CompChild2 from './CompChild2.vue'

const { name, nameChild1, nameChild2, storeScope } = defineProps({
  name: String,
  nameChild1: String,
  nameChild2: String,
  storeScope: String,
})

setStoreScope(storeScope as string)

const nameStore = useStore(NameStore)
const child1NameStore = useStore(Child1NameStore)
const child2NameStore = useStore(Child2NameStore)

watch(
  () => name,
  () => nameStore.setName(name, nameChild1, nameChild2),
  { immediate: true },
)
</script>
<template>
  <div :class="`comp-child-1-${storeScope}`">
    <div class="comp-child-1-case1">CompChild1: {{ storeScope }}</div>
    <div class="comp-child-1-case2">
      CompChild1:[nameStore.name = {{ nameStore.name }}]
    </div>
    <div class="comp-child-1-case3">
      CompChild1:[child1NameStore.child1Name = {{ child1NameStore.child1Name }}]
    </div>
    <div class="comp-child-1-case4">
      CompChild1:[child2NameStore.child2Name = {{ child2NameStore.child2Name }}]
    </div>
    <CompChild2 :store-scope="storeScope" />
  </div>
</template>
