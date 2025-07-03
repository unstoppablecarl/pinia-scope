<script setup lang="ts">
import { useStore } from '../../src'
import {
  Child1NameStore,
  Child2NameStore,
  NameStore,
} from '../helpers/test-stores'

const { storeScope } = defineProps({
  storeScope: String,
})

const nameStore = useStore(NameStore)
const child1NameStore = useStore(Child1NameStore)
const child2NameStore = useStore(Child2NameStore)
</script>
<template>
  <div class="comp-child-2">
    <div class="comp-child-2-case1">CompChild2: {{ storeScope }}</div>
    <div class="comp-child-2-case2">
      CompChild2:[nameStore.name = {{ nameStore.name }}]
    </div>
    <div class="comp-child-2-case3">
      CompChild2:[child1NameStore.child1Name = {{ child1NameStore.child1Name }}]
    </div>
    <div class="comp-child-2-case4">
      CompChild2:[child2NameStore.child2Name = {{ child2NameStore.child2Name }}]
    </div>
  </div>
</template>
