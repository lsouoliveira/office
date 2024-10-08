<script setup lang="ts">
import { defineModel, defineEmits } from 'vue'
import PianoViewer from './piano_viewer.vue'

const model = defineModel()
const emit = defineEmits(['press', 'release'])
</script>

<template>
  <b-modal v-model="model" width="">
    <piano-viewer @press="emit('press', $event)" @release="emit('release', $event)" />
  </b-modal>
</template>

<style scoped></style>
