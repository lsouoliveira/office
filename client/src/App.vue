<script setup lang="ts">
import { onMounted, onUnmounted, useTemplateRef, reactive, useRef } from 'vue'
import { Game } from './game/game'

const gameRoot = useTemplateRef('gameRoot')
const chatMessageInput = useTemplateRef('chatMessageInput')
const chatMessage = reactive({
  value: '',
  show: false
})

onMounted(() => {
  const game = new Game(gameRoot.value)
  game.init()

  window.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'Enter':
        chatMessage.show = true
        setTimeout(() => {
          chatMessageInput.value.focus()
        }, 0)
        break
      case 'Escape':
        chatMessage.show = false
        break
    }
  })
})

onUnmounted(() => {
  window.removeEventListener('keydown', () => {})
})

const handleChatMessage = ({ target: { value } }) => {
  const message = value.trim()

  chatMessage.value = ''

  setTimeout(() => {
    chatMessage.show = false
  }, 0)

  window.dispatchEvent(new CustomEvent('ui:send_message', { detail: { message } }))
}
</script>

<template>
  <div ref="gameRoot" id="game-root"></div>
  <div class="absolute bottom-0 left-0 w-full">
    <div class="flex items-center justify-center p-4">
      <b-input
        placeholder="Digite alguma coisa..."
        v-model="chatMessage.value"
        v-show="chatMessage.show"
        @keydown.enter="handleChatMessage"
        class="w-full max-w-xl"
        ref="chatMessageInput"
      />
    </div>
  </div>
</template>

<style scoped>
#game-root {
  width: 100%;
  height: 100%;
}
</style>
