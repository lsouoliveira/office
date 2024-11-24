<script setup lang="ts">
import { onMounted, onUnmounted, useTemplateRef, reactive, ref, computed } from 'vue'
import { Game } from './../game/game'
import spritesData from './../game/data/sprites.json'
import { OSApplication } from './../os/os_application'
import { Piano } from './../piano'

import ConfigModal from './config_modal.vue'
import PianoModal from './piano_modal.vue'
import TennisModal from './tennis_modal.vue'
import InventoryModal from './inventory_modal.vue'
import ShopModal from './shop_modal.vue'
import LotteryModal from './lottery_modal.vue'
import HotkeysModal from './hotkeys_modal.vue'

const EMOTES = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '-', '=']

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

const showConfigModal = ref(false)
const showTennisModal = ref(false)
const showInventoryModal = ref(false)
const showShopModal = ref(false)
const showLotteryModal = ref(false)
const showHotkeysModal = ref(false)
const showOs = ref(false)
const showPianoModal = ref(false)
const osApplication = ref(null)
const piano = ref(null)
const isAudioEnabled = ref(false)
const itemsSearch = ref('')

const osRoot = useTemplateRef('osRoot')

onMounted(async () => {
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

  window.addEventListener('ui:show_ping_pong', () => {
    showTennisModal.value = true
  })

  window.addEventListener('keydown', (e) => {
    if (showOs.value) {
      return
    }

    switch (e.key) {
      case 'Enter':
        if (!showConfigModal.value && !showTennisModal.value) {
          chatMessage.show = true
          setTimeout(() => {
            chatMessageInput?.value?.focus()
          }, 0)
        }
        return
      case 'Escape':
        chatMessage.show = false
        clearSelection()
        return
      case '0':
        if (e.ctrlKey) {
          items.show = !items.show
        }
        return
    }

    if (!e.ctrlKey && EMOTES.includes(e.key) && !chatMessage.show) {
      window.dispatchEvent(new CustomEvent('ui:emote', { detail: { id: e.key } }))
      return
    }

    if (e.ctrlKey && e.key >= '1' && e.key <= '5') {
        const hotkeys = getHotkeys()
        const hotkey = hotkeys.find((h) => h.name === `ctrl${e.key}`)

        if (hotkey) {
            window.gameClient.sendMessage(hotkey.value.substring(0, 100))
        }
      return
    }
  })
})

onUnmounted(() => {
  window.removeEventListener('keydown', () => {})
  window.removeEventListener('keyup', () => {})
})

const getHotkeys = () => {
    try {
        return JSON.parse(localStorage.getItem('hotkeys')) || []
    } catch(e) {
        return []
    }
}

const handleChatMessage = ({ target: { value } }) => {
  const message = value.trim()

  chatMessage.value = ''

  setTimeout(() => {
    chatMessage.show = false
  }, 0)

  if (message === '/piano') {
    showPianoModal.value = true
  } else if (message === '/tennis') {
    showTennisModal.value = true
  } else {
    window.dispatchEvent(new CustomEvent('ui:send_message', { detail: { message } }))
  }
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

  for (const key in spritesData) {
    const { width, height, states, tileset } = spritesData[key]
    const tileId = states[0]
    const tileSize = spritesData[key].tileSize || 16

    try {
      const image = await loadTileset(tileset)
      const tilesWidth = image.width / tileSize
      const offsetX = (tileId % tilesWidth) * tileSize
      const offsetY = Math.floor(tileId / tilesWidth) * tileSize
      const scale = 16 / tileSize 

      const sprite = {
        id: key,
        image_url: tileset,
        offsetX,
        offsetY,
        width,
        height,
        tileSize,
        scale
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

const handleOsClose = () => {
  if (osApplication.value) {
    osApplication.value.teardown()
  }
}

const handleNotePress = (note) => {
  if (piano.value) {
    piano.value.play(note)
  }

  window.dispatchEvent(new CustomEvent('ui:note_press', { detail: { note } }))
}

const handleNoteRelease = (note) => {
  if (piano.value) {
    piano.value.release(note)
  }

  window.dispatchEvent(new CustomEvent('ui:note_release', { detail: { note } }))
}

const toggleAudio = () => {
  isAudioEnabled.value = !isAudioEnabled.value

  if (isAudioEnabled.value && !piano.value) {
    const pianoInstance = new Piano()

    pianoInstance.init().then(() => {
      piano.value = pianoInstance

      window.addEventListener('ui:note_played', ({ detail: { note } }) => {
        if (!isAudioEnabled.value) {
          return
        }

        console.log('Playing note:', note)

        pianoInstance.play(note)
      })

      window.addEventListener('ui:note_released', ({ detail: { note } }) => {
        if (!isAudioEnabled.value) {
          return
        }

        pianoInstance.release(note)
      })
    })
  }
}

const filteredItems = computed(() => {
  return items.data.filter((item) => item.id.includes(itemsSearch.value))
})
</script>
<template>
  <config-modal @close="showConfigModal = false" v-model="showConfigModal" v-if="showConfigModal" />
  <tennis-modal @close="showTennisModal = false" v-model="showTennisModal" v-if="showTennisModal" />
  <inventory-modal @close="showInventoryModal = false" v-model="showInventoryModal" v-if="showInventoryModal" />
  <shop-modal @close="showShopModal = false" v-model="showShopModal" v-if="showShopModal" />
  <lottery-modal @close="showLotteryModal = false" v-model="showLotteryModal" v-if="showLotteryModal" />
  <hotkeys-modal @close="showHotkeysModal = false" v-model="showHotkeysModal" v-if="showHotkeysModal" />

  <div class="fixed top-0 left-0 w-full">
    <div class="flex items-center justify-end p-4 gap-2">
      <b-button
        icon-left="keyboard"
        type="is-primary"
        @click="showHotkeysModal = true"
      />

      <b-button
        icon-left="cash"
        type="is-success"
        @click="showLotteryModal = true"
      />

      <b-button
        icon-left="store"
        type="is-danger"
        @click="showShopModal = true"
      />

      <b-button
        icon-left="bag-personal"
        type="is-info"
        @click="showInventoryModal = true"
      />

      <b-button
        :icon-left="isAudioEnabled ? 'volume-high' : 'volume-mute'"
        type="is-info"
        @click="toggleAudio"
      />
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
      <div>
        <b-input v-model="itemsSearch" placeholder="Search..." class="w-full" />
      </div>
      <div class="flex flex-col items-center space-y-2 w-full">
        <div v-for="item in filteredItems" :key="item.id" class="w-full" @click="handleItem(item)">
          <button
            class="flex flex-col items-center justify-center w-full hover:bg-gray-200 dark:hover:bg-gray-700 p-2 gap-2"
          >
            <div
              :style="{
                width: `${item.width * item.tileSize}px`,
                aspectRatio: `${item.width}/${item.height}`,
                backgroundImage: `url(${item.image_url})`,
                backgroundPosition: `-${item.offsetX}px -${item.offsetY}px`,
                transform: `scale(${item.scale})`
              }"
            ></div>
            <div class="flex items-center justify-center text-white">
              {{ item.id }}
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>

  <b-modal v-model="showOs" @close="handleOsClose" width="1280">
    <div
      class="aspect-video w-full max-w-[1280px] mx-auto rounded-lg overflow-hidden"
      ref="osRoot"
    ></div>
  </b-modal>

  <piano-modal v-model="showPianoModal" @press="handleNotePress" @release="handleNoteRelease" />
</template>

<style scoped>
#game-root {
  width: 100%;
  height: 100%;
}
</style>
