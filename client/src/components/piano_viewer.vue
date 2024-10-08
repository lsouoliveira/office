<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, defineEmits } from 'vue'

const WHITE_KEYS = [
  'C2',
  'D2',
  'E2',
  'F2',
  'G2',
  'A2',
  'B2',
  'C3',
  'D3',
  'E3',
  'F3',
  'G3',
  'A3',
  'B3',
  'C4',
  'D4',
  'E4',
  'F4',
  'G4',
  'A4',
  'B4',
  'C5',
  'D5',
  'E5',
  'F5',
  'G5',
  'A5',
  'B5',
  'C6',
  'D6',
  'E6',
  'F6',
  'G6',
  'A6',
  'B6',
  'C7'
]

const BLACK_KEYS = [
  'C#2',
  'D#2',
  'F#2',
  'G#2',
  'A#2',
  'C#3',
  'D#3',
  'F#3',
  'G#3',
  'A#3',
  'C#4',
  'D#4',
  'F#4',
  'G#4',
  'A#4',
  'C#5',
  'D#5',
  'F#5',
  'G#5',
  'A#5',
  'C#6',
  'D#6',
  'F#6',
  'G#6',
  'A#6'
]

const WHITE_KEY_SHORCUTS = [
  49, 50, 51, 52, 53, 54, 55, 56, 57, 48, 81, 87, 69, 82, 84, 89, 85, 73, 79, 80, 65, 83, 68, 70,
  71, 72, 74, 75, 76, 90, 88, 67, 86, 66, 78, 77
]
const BLACK_KEY_SHORTCUTS = [
  49, 50, 52, 53, 0, 56, 57, 81, 87, 69, 84, 89, 73, 79, 80, 83, 68, 71, 72, 74, 76, 90, 67, 86, 66
]

const emit = defineEmits(['press', 'release'])

onMounted(async () => {
  const notes = [WHITE_KEYS, BLACK_KEYS].flat()

  keys.value = notes.map((key) => createKey(key))

  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keyup', handleKeyUp)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('keyup', handleKeyUp)
})

const keys = ref(null)

const createKey = (key: string) => {
  return {
    key,
    pressed: false
  }
}

const handleKeyDown = (e) => {
  document.title = e.keyCode

  const index = WHITE_KEY_SHORCUTS.indexOf(e.keyCode)

  if (index > -1 && !e.shiftKey) {
    handlePianoKeyPress(WHITE_KEYS[index])
  }

  const blackIndex = BLACK_KEY_SHORTCUTS.indexOf(e.keyCode)

  if (blackIndex > -1 && e.shiftKey) {
    handlePianoKeyPress(BLACK_KEYS[blackIndex])
  }
}

const handleKeyUp = (e) => {
  const index = WHITE_KEY_SHORCUTS.indexOf(e.keyCode)

  if (index > -1) {
    handlePianoKeyRelease(WHITE_KEYS[index])
  }

  const blackIndex = BLACK_KEY_SHORTCUTS.indexOf(e.keyCode)

  if (blackIndex > -1) {
    handlePianoKeyRelease(BLACK_KEYS[blackIndex])
  }
}

const whiteKeys = computed(() => keys.value?.filter((key) => WHITE_KEYS.includes(key.key)))
const blackKeys = computed(() => keys.value?.filter((key) => BLACK_KEYS.includes(key.key)))
const whiteKeyWidth = 100 / WHITE_KEYS.length
const blackKeyWidth = whiteKeyWidth * 0.6
const blackKeyGroups = computed(() => {
  const groups = []

  for (let i = 0; i < BLACK_KEYS.length; i += 5) {
    groups.push(BLACK_KEYS.slice(i, i + 5))
  }

  return groups
})

const handlePianoKeyPress = (key: string) => {
  const index = keys.value.findIndex((k) => k.key === key)

  if (index !== -1 && !keys.value[index].pressed) {
    keys.value[index].pressed = true

    emit('press', key)
  }
}

const handlePianoKeyRelease = (key: string) => {
  const index = keys.value.findIndex((k) => k.key === key)

  if (index !== -1 && keys.value[index].pressed) {
    keys.value[index].pressed = false

    emit('release', key)
  }
}

const blackKeyPositions = [
  whiteKeyWidth * 1 - 0.6 * blackKeyWidth,
  whiteKeyWidth * 2 - 0.3 * blackKeyWidth,
  whiteKeyWidth * 4 - 0.6 * blackKeyWidth,
  whiteKeyWidth * 5 - 0.5 * blackKeyWidth,
  whiteKeyWidth * 6 - 0.6 * blackKeyWidth
]

const getBlackKeyPosition = (index: number) => {}
</script>

<template>
  <div class="relative flex piano-viewer w-full xl:max-w-screen-xl 2xl:max-w-screen-2xl mx-auto">
    <div
      v-for="key in whiteKeys"
      :key="key"
      :style="{ width: `${whiteKeyWidth}%` }"
      :class="{ 'piano-key': true, 'piano-key--pressed': key.pressed }"
      @mousedown="handlePianoKeyPress(key.key)"
      @mouseup="handlePianoKeyRelease(key.key)"
      @mouseleave="handlePianoKeyRelease(key.key)"
    ></div>

    <div v-for="(group, index) in blackKeyGroups" :key="group">
      <div v-for="(position, positionIndex) in blackKeyPositions" :key="position">
        <div
          v-if="group[positionIndex]"
          :key="group[positionIndex]"
          :style="{
            width: `${blackKeyWidth}%`,
            left: `${index * whiteKeyWidth * 7 + position}%`
          }"
          :class="{
            'black-piano-key': true,
            'black-piano-key--pressed': keys?.find((k) => k.key === group[positionIndex])?.pressed
          }"
          @mousedown="handlePianoKeyPress(group[positionIndex])"
          @mouseup="handlePianoKeyRelease(group[positionIndex])"
          @mouseleave="handlePianoKeyRelease(group[positionIndex])"
        ></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.piano-viewer {
  height: 320px;
}

.piano-key {
  @apply bg-white border-2 border-gray-900 h-full rounded-b-lg;
}

.piano-key--pressed {
  @apply h-[98.5%] bg-gray-200 shadow-inner;
}

.black-piano-key {
  @apply absolute bg-black h-[60%] rounded-b-lg;
}

.black-piano-key--pressed {
  @apply h-[58%] bg-gray-400 shadow-inner;
}
</style>
