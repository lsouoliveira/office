<script setup lang="ts">
import { onMounted, onUnmounted, useTemplateRef, reactive, ref, computed } from 'vue'
import { Game } from './game/game'
import { SPRITES } from './game/data/sprites'
import { OSApplication } from './os/os_application'

const gameRoot = useTemplateRef('gameRoot')
const chatMessageInput = useTemplateRef('chatMessageInput')
const chatMessage = reactive({
  value: '',
  show: false
})
const items = reactive({
  data: [],
  show: false
})
const user = reactive({
  name: localStorage.getItem('username') || ''
})
const showConfigModal = ref(false)
const showOs = ref(false)
const osApplication = ref(null)

const osRoot = useTemplateRef('osRoot')

onMounted(() => {
  const game = new Game(gameRoot.value)
  game.init()

  loadSprites().then((sprites) => {
    items.data = sprites
  })

  window.addEventListener('ui:show_os', () => {
    showOs.value = true

    setTimeout(() => {
      const os = new OSApplication(osRoot.value)
      os.start()

      osApplication.value = os
    }, 0)
  })

  window.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'Enter':
        if (!showConfigModal.value) {
          chatMessage.show = true
          setTimeout(() => {
            chatMessageInput.value.focus()
          }, 0)
        }
        break
      case 'Escape':
        chatMessage.show = false
        clearSelection()
        break
      case '0':
        if (e.ctrlKey) {
          items.show = !items.show
        }

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

const clearSelection = () => {
  window.dispatchEvent(new CustomEvent('ui:clear_selection'))
}

const loadTileset = (tileset) => {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.src = tileset
    image.onload = () => resolve(image)
    image.onerror = reject
  })
}

const loadSprites = async () => {
  const sprites = []

  for (const key in SPRITES) {
    const { width, height, states, tileset } = SPRITES[key]
    const tileId = states[0]

    try {
      const image = await loadTileset(tileset)
      const tilesWidth = image.width / 16
      const offsetX = (tileId % tilesWidth) * 16
      const offsetY = Math.floor(tileId / tilesWidth) * 16

      const sprite = {
        id: key,
        image_url: tileset,
        offsetX,
        offsetY,
        width,
        height
      }

      sprites.push(sprite)
    } catch (error) {
      console.error('Error loading tileset:', tileset)
    }
  }

  return sprites
}

const handleItem = (item) => {
  window.dispatchEvent(new CustomEvent('ui:select_item', { detail: { id: item.id } }))
}

const handleConfig = (e) => {
  e.preventDefault()

  const form = new FormData(e.target)
  const name = form.get('name')

  localStorage.setItem('username', name)
  showConfigModal.value = false

  window.dispatchEvent(new CustomEvent('ui:config', { detail: { name } }))
}

const handleOsClose = () => {
  if (osApplication.value) {
    osApplication.value.teardown()
  }
}
</script>
<template>
  <b-modal
    v-model="showConfigModal"
    has-modal-card
    trap-focus
    :destroy-on-hide="false"
    aria-role="dialog"
    aria-label="Configurações"
    close-button-aria-label="Close"
    aria-modal
  >
    <form @submit="handleConfig">
      <div class="modal-card" style="width: auto">
        <header class="modal-card-head">
          <p class="modal-card-title">Configurações</p>
          <button type="button" class="delete" @click="$emit('close')" />
        </header>
        <section class="modal-card-body">
          <b-field label="Nome">
            <b-input type="text" placeholder="Como você se chama?" name="name" required> </b-input>
          </b-field>
        </section>

        <footer class="modal-card-foot">
          <b-button label="Salvar" type="is-primary" expanded native-type="submit" />
        </footer>
      </div>
    </form>
  </b-modal>

  <div class="fixed top-0 left-0 w-full">
    <div class="flex items-center justify-end p-4">
      <b-button icon-left="cog" type="is-warning" @click="showConfigModal = true" />
    </div>
  </div>

  <div ref="gameRoot" id="game-root"></div>

  <div class="absolute bottom-0 left-0 w-full">
    <div class="flex items-center justify-center p-4">
      <b-input
        placeholder="Digite alguma coisa..."
        v-model="chatMessage.value"
        v-if="chatMessage.show"
        @keydown.enter="handleChatMessage"
        class="w-full max-w-xl"
        ref="chatMessageInput"
      />
    </div>
  </div>

  <div
    class="fixed top-0 left-0 h-screen bg-white border-r w-48 p-4 dark:bg-gray-800 dark:border-gray-700 overflow-auto"
    v-if="items.show"
  >
    <div class="flex flex-col items-center space-y-4">
      <div class="text-lg font-bold text-white dark:text-gray-200">Items</div>
      <div class="flex flex-col items-center space-y-2 w-full">
        <div v-for="item in items.data" :key="item.id" class="w-full" @click="handleItem(item)">
          <button class="w-full hover:bg-gray-200 dark:hover:bg-gray-700 p-2">
            <div
              :style="{
                width: `${item.width * 16}px`,
                aspectRatio: `${item.width}/${item.height}`,
                backgroundImage: `url(${item.image_url})`,
                backgroundPosition: `-${item.offsetX}px -${item.offsetY}px`
              }"
            ></div>
          </button>
        </div>
      </div>
    </div>
  </div>

  <b-modal v-model="showOs" @close="handleOsClose" width="960" >
    <div class="aspect-video w-full max-w-[960px] mx-auto rounded-lg overflow-hidden" ref="osRoot"></div>
  </b-modal>
</template>

<style scoped>
#game-root {
  width: 100%;
  height: 100%;
}
</style>
