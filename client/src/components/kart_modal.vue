<script setup lang="ts">
import { defineModel, ref, onMounted, computed, useTemplateRef } from 'vue'
import { Game as KartGame } from "../kart/game"

const model = defineModel()
const rootRef = useTemplateRef("rootRef") 
const kartGame = ref(null)

onMounted(() => {
    kartGame.value = new KartGame(rootRef.value)
    kartGame.value.init()
})
</script>

<template>
  <b-modal v-model="model" full-screen @close="handleClose">
    <div class="w-full h-full" ref="rootRef">
    </div>
  </b-modal>
</template>

<style scoped>
.game:hover {
  cursor: none;
}
</style>
