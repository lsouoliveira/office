<script setup lang="ts">
import { onMounted, defineModel, ref, computed } from 'vue'

const SKIN_URLS = [
  { url: '/resources/images/Adam_48x48.png', name: 'Adam' },
  { url: '/resources/images/Alex_48x48.png', name: 'Alex' },
  { url: '/resources/images/Amelia_48x48.png', name: 'Amelia' },
  { url: '/resources/images/Bob_48x48.png', name: 'Bob' },
  { url: '/resources/images/Conference_woman_48x48.png', name: 'Conference Woman' },
  { url: '/resources/images/Edward_48x48.png', name: 'Edward' },
  { url: '/resources/images/Molly_48x48.png', name: 'Molly' },
  { url: '/resources/images/Pier_48x48.png', name: 'Pier' },
  { url: '/resources/images/Prisoner_1_48x48.png', name: 'Prisoner 1' },
  { url: '/resources/images/Prisoner_2_48x48.png', name: 'Prisoner 2' },
  { url: '/resources/images/Rob_48x48.png', name: 'Rob' },
  { url: '/resources/images/Samuel_48x48.png', name: 'Samuel' },
  { url: '/resources/images/Santa_Claus_48x48.png', name: 'Santa Claus' }
]

const SKINS_ORDER = [
  'Bob',
  'Amelia',
  'Alex',
  'Adam',
  'Conference Woman',
  'Edward',
  'Molly',
  'Pier',
  'Prisoner 1',
  'Prisoner 2',
  'Rob',
  'Samuel',
  'Santa Claus'
]

const model = defineModel()

onMounted(async () => {
  await loadSkins()

  skins.value = skins.value.sort((a, b) => {
    return SKINS_ORDER.indexOf(a.name) - SKINS_ORDER.indexOf(b.name)
  })

  isLoading.value = false

  if (player.value.skin) {
    currentSkinIndex.value = skins.value.findIndex((skin) => skin.name === player.value.skin)
  } else {
    currentSkinIndex.value = 0
  }
})

const currentSkinIndex = ref(0)
const skins = ref([])
const isLoading = ref(true)
const player = ref({
  name: localStorage.getItem('username'),
  skin: localStorage.getItem('skin')
})

const loadSkins = async () => {
  const promises = SKIN_URLS.map((skin) => loadSkin(skin))

  await Promise.all(promises)
}
const loadSkin = async (skin) => {
  const img = new Image()

  img.src = skin.url

  return new Promise((resolve, reject) => {
    img.onload = () => {
      addSkin(skin, img)

      resolve()
    }

    img.onerror = (e) => {
      reject(e)
    }
  })
}

const handleSkinsLoaded = () => {
  currentSkinIndex.value = 0
}

const addSkin = (skin, image) => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  canvas.width = 48
  canvas.height = 96

  ctx.drawImage(image, 144, 0, 48, 96, 0, 0, 48, 96)

  skins.value.push({
    id: crypto.randomUUID(),
    name: skin.name,
    url: image.src,
    data: canvas.toDataURL()
  })
}

const handleConfig = (e) => {
  e.preventDefault()

  const payload = {
    name: player.value.name,
    skinName: currentSkin.value.name
  }

  saveConfig(payload)

  window.dispatchEvent(new CustomEvent('ui:config', { detail: payload }))

  model.value = false
}

const saveConfig = ({ name, skinName }) => {
  localStorage.setItem('username', name)
  localStorage.setItem('skin', skinName)
}

const currentSkin = computed(() => {
  if (currentSkinIndex.value === null) {
    return null
  }

  return skins.value[currentSkinIndex.value]
})

const nextSkin = () => {
  currentSkinIndex.value = (currentSkinIndex.value + 1) % skins.value.length
}

const previousSkin = () => {
  currentSkinIndex.value = (currentSkinIndex.value - 1 + skins.value.length) % skins.value.length
}
</script>

<template>
  <b-modal v-model="model" has-modal-card>
    <form @submit="handleConfig">
      <div class="modal-card" style="width: auto">
        <header class="modal-card-head">
          <p class="modal-card-title">Configurações</p>
          <button type="button" class="delete" @click="$emit('close')" />
        </header>

        <section class="modal-card-body">
          <b-field label="Personagem" v-if="!isLoading">
            <div class="flex items-center justify-between">
              <b-button icon-left="arrow-left-bold" type="is-secondary" @click="previousSkin" />
              <img
                :src="currentSkin?.data"
                width="64"
                height="128"
                style="image-rendering: pixelated"
              />
              <b-button icon-left="arrow-right-bold" type="is-secondary" @click="nextSkin" />
            </div>
          </b-field>

          <b-field label="Nome">
            <b-input
              type="text"
              placeholder="Como você se chama?"
              name="name"
              required
              v-model="player.name"
            />
          </b-field>
        </section>

        <footer class="modal-card-foot">
          <b-button label="Salvar" type="is-primary" expanded native-type="submit" />
        </footer>
      </div>
    </form>
  </b-modal>
</template>

<style scoped></style>
