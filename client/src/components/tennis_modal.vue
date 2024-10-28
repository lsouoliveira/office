<script setup lang="ts">
import { defineModel, ref, onMounted, computed, useTemplateRef } from 'vue'
import { TennisClient } from '../tennis/client'
import { TennisGame, StageType, WIDTH, HEIGHT, PAD_WIDTH } from '../tennis/game'

enum State {
  WAITING_FOR_PLAYERS = 0,
  PLAYING = 1,
  WAITING_FOR_REMATCH = 2
}

const model = defineModel()
const tennisClient = ref(null)
const isLoading = ref(false)
const users = ref([])
const pad1 = ref(null)
const pad2 = ref(null)
const state = ref(null)
const username = ref(null)
const userId = ref(null)
const game = ref(null)
const gameRoot = useTemplateRef('gameRoot')
const score = ref([0, 0])
const lastPlayerMove = ref(null)
const playerPositionChanged = ref(false)
const rematchSent = ref(false)
const messages = ref([])
const message = ref('')
const chat = useTemplateRef('chat')
const isAudioEnabled = ref(false)

onMounted(() => {
  username.value = localStorage.getItem('username') || 'Sem nome'
  userId.value = localStorage.getItem('userId')

  tennisClient.value = new TennisClient('ws://localhost:3001', {
    userId: userId.value,
    username: username.value
  })
  tennisClient.value.connect()

  tennisClient.value.on('session', (data: any) => {
    localStorage.setItem('userId', data.userId)

    userId.value = data.userId
  })

  tennisClient.value.on('room', (roomState: any) => {
    isLoading.value = false
    users.value = roomState.users
    score.value = roomState.score

    pad1.value = roomState.pad1
    pad2.value = roomState.pad2

    state.value = roomState.state
    rematchSent.value = false

    if (!game.value) {
      game.value = new TennisGame(gameRoot.value, handlePadMove, handleUpdate)

      game.value.init()
      game.value.start()
    }

    setGameStage(state.value)
  })

  tennisClient.value.on('game:state', (state: any) => {
    const playerPad = getPlayerPad()

    score.value = state.score

    if (playerPad) {
      if (pad1.value?.userId === playerPad.userId) {
        game.value?.updateBallData(
          WIDTH - state.ball.x,
          HEIGHT - state.ball.y,
          [state.ball.direction[0] * -1, state.ball.direction[1] * -1],
          state.ball.speed
        )

        if (pad2.value) {
          game.value?.setPadPosition(1, WIDTH - state.pad2?.x - PAD_WIDTH)
        }
      } else {
        game.value?.updateBallData(
          state.ball.x,
          state.ball.y,
          state.ball.direction,
          state.ball.speed
        )

        if (pad1.value) {
          game.value?.setPadPosition(1, state.pad1?.x)
        }
      }
    } else {
      game.value?.updateBallData(state.ball.x, state.ball.y, state.ball.direction, state.ball.speed)

      if (pad1.value) {
        game.value?.setPadPosition(1, state.pad1?.x)
      }

      if (pad2.value) {
        game.value?.setPadPosition(2, state.pad2?.x)
      }
    }
  })

  tennisClient.value.on('game:hit', () => {
    if (!isAudioEnabled.value) {
      return
    }

    game.value?.playHitSound()
  })

  tennisClient.value.on('user:message', ({ id, username, message, created_at }) => {
    messages.value.push({ id, username, message, created_at: new Date(created_at) })
    setTimeout(() => {
      if (chat.value) {
        chat.value.scrollTop = chat.value.scrollHeight
      }
    }, 0)
  })

  tennisClient.value.on('user:connected', (user: any) => {
    users.value.push(user)
  })

  tennisClient.value.on('user:disconnected', (user: any) => {
    users.value = users.value.filter((u) => u.id !== user.id)

    if (pad1.value?.userId === user.id) {
      pad1.value = null
    }

    if (pad2.value?.userId === user.id) {
      pad2.value = null
    }
  })
})

const setGameStage = (state: State) => {
  switch (state) {
    case State.WAITING_FOR_PLAYERS:
      game.value.setStage(StageType.WAITING_FOR_PLAYERS)
      break
    case State.PLAYING:
      game.value.setStage(StageType.PLAYING)
      game.value.enablePlayerControls(getPlayerPad() !== null)
      break
    case State.WAITING_FOR_REMATCH:
      game.value.setStage(StageType.WAITING_FOR_REMATCH)
      game.value.setWinnerName(getWinnerName() || 'Sem nome')
      break
  }
}

const getWinnerName = () => {
  if (score.value[0] > score.value[1]) {
    return getUser(pad1.value?.userId)?.username
  }

  return getUser(pad2.value?.userId)?.username
}

const debounce = (fn: Function, delay: number) => {
  let timeoutId: number

  return (...args: any[]) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      fn(...args)
    }, delay)
  }
}

const handlePadMove = (x: number) => {
  const playerPad = getPlayerPad()

  if (!playerPad) {
    return
  }

  if (lastPlayerMove.value === x) {
    return
  }

  lastPlayerMove.value = x
  playerPositionChanged.value = true
}

const handleUpdate = () => {
  if (!playerPositionChanged.value) {
    return
  }

  const playerPad = getPlayerPad()

  if (!playerPad) {
    return
  }

  if (playerPad.userId === pad1.value.userId) {
    tennisClient.value.movePad(playerPad.userId, WIDTH - lastPlayerMove.value - PAD_WIDTH)
  } else {
    tennisClient.value.movePad(playerPad.userId, lastPlayerMove.value)
  }

  playerPositionChanged.value = false
}

const canJoin = computed(() => {
  return state.value === State.WAITING_FOR_PLAYERS && !getPlayerPad()
})

const joinGame = () => {
  tennisClient.value.joinGame()
}

const bottomPadName = computed(() => {
  const playerPad = getPlayerPad()

  if (playerPad) {
    return getUser(playerPad.userId)?.username
  }

  if (!pad2.value) {
    return null
  }

  return getUser(pad2.value.userId)?.username
})

const topPadName = computed(() => {
  const playerPad = getPlayerPad()

  if (playerPad) {
    return getOponentUser()?.username
  }

  if (pad1.value && !pad2.value) {
    return getUser(pad1.value.userId)?.username
  }

  return getUser(pad2.value.userId)?.username
})

const getPlayerPad = () => {
  if (pad1.value?.userId === userId.value) {
    return pad1.value
  }

  if (pad2.value?.userId === userId.value) {
    return pad2.value
  }

  return null
}

const getUser = (userId: string) => {
  return users.value.find((user) => user.id === userId)
}

const getOponentUser = () => {
  if (pad1.value?.userId === userId.value) {
    return getUser(pad2.value?.userId)
  }

  return getUser(pad1.value?.userId)
}

const spectators = computed(() => {
  return users.value.filter(
    (user) => user.id !== pad1.value?.userId && user.id !== pad2.value?.userId && user.isConnected
  )
})

const hasOpponent = computed(() => {
  if (pad1.value && pad2.value) {
    return true
  }

  if ((pad1.value || pad2.value) && !getPlayerPad()) {
    return true
  }

  return false
})

const topScore = computed(() => {
  const playerPad = getPlayerPad()

  if (playerPad) {
    if (playerPad.userId === pad1.value?.userId) {
      return score.value[0]
    }

    return score.value[1]
  }

  return score.value[0]
})

const bottomScore = computed(() => {
  const playerPad = getPlayerPad()

  if (playerPad) {
    if (playerPad.userId === pad1.value?.userId) {
      return score.value[1]
    }

    return score.value[0]
  }

  return score.value[1]
})

const handleClose = () => {
  tennisClient.value?.disconnect()
  game.value?.destroy()
}

const canRematch = computed(() => {
  return state.value === State.WAITING_FOR_REMATCH && getPlayerPad()
})

const rematch = () => {
  rematchSent.value = true
  tennisClient.value.rematch()
}

const sendMessage = () => {
  if (!message.value) {
    return
  }

  tennisClient.value.sendMessage(message.value)
  message.value = ''
}
</script>

<template>
  <b-modal v-model="model" width="" @close="handleClose" can-cancel="['x', 'escape']">
    <div>
      <div class="flex">
        <div class="flex items-start justify-end w-full px-4" v-if="!isLoading">
          <div class="w-full flex flex-col items-end gap-4">
            <div class="flex flex-col bg-white rounded-lg w-full max-w-sm">
              <div class="p-4 border-b">
                <div class="text-xl font-bold">Espectadores</div>
              </div>
              <div class="flex flex-col p-4 gap-2 max-h-96 overflow-y-auto">
                <div v-for="spectator in spectators" :key="spectator.id">
                  <div>{{ spectator.username }}</div>
                </div>

                <div v-if="spectators.length === 0" class="text-center w-full">
                  Nenhum espectador
                </div>
              </div>
            </div>

            <div class="flex flex-col bg-white rounded-lg w-full max-w-sm">
              <div class="p-4 border-b">
                <div class="text-xl font-bold">Chat</div>
              </div>
              <div class="flex flex-col p-4 gap-2 h-40 overflow-y-auto" ref="chat">
                <div v-for="message in messages" :key="message.id">
                  <span class="font-bold">{{
                    `${message.created_at.getHours()}:${message.created_at.getMinutes()} ${message.username}: `
                  }}</span>
                  <span>{{ message.message }}</span>
                </div>

                <div
                  v-if="messages.length === 0"
                  class="text-center w-full h-full grow flex items-center justify-center"
                >
                  Nenhuma mensagem
                </div>
              </div>
              <div>
                <b-input
                  class="w-full p-2 border-t border-gray-300"
                  placeholder="Digite uma mensagem..."
                  @keydown.enter="sendMessage"
                  v-model="message"
                />
              </div>
            </div>
          </div>
        </div>

        <div
          style="width: 480px; height: 640px"
          class="game w-full shrink-0 bg-black"
          ref="gameRoot"
        ></div>

        <div class="flex flex-col items-start w-full px-4 gap-4" v-if="!isLoading">
          <div class="flex flex-col w-full max-w-sm bg-white rounded-lg">
            <div class="p-4 border-b">
              <div class="text-xl font-bold" v-if="hasOpponent">
                {{ topPadName }}
              </div>
              <div class="text-xl font-bold" v-else>Aguardando oponente...</div>
            </div>
            <div class="p-4">
              <div class="flex items-center justify-center text-2xl gap-2">
                <span>{{ topScore }}</span>
                <span>x</span><span>{{ bottomScore }}</span>
              </div>
            </div>
            <div class="p-4 border-t">
              <div v-if="canJoin">
                <b-button type="is-info" expanded @click="joinGame">Entrar como jogador</b-button>
              </div>

              <div v-else>
                <div class="text-xl font-bold">
                  {{ bottomPadName }}
                </div>
              </div>
            </div>
            <div class="p-4 border-t" v-if="canRematch">
              <div>
                <b-button type="is-info" expanded @click="rematch" :disabled="rematchSent"
                  >Jogar novamente</b-button
                >
              </div>
            </div>
          </div>

          <div class="flex flex-col w-full max-w-sm">
            <div class="flex justify-end w-full">
              <b-button
                :icon-left="isAudioEnabled ? 'volume-high' : 'volume-mute'"
                type="is-info"
                @click="isAudioEnabled = !isAudioEnabled"
              />
            </div>
          </div>
        </div>

        <div class="flex items-start w-full p-4" v-if="isLoading">
          <div class="flex flex-col w-full max-w-sm bg-white rounded-lg">
            <div class="p-4">
              <div class="text-xl font-bold">Conectando...</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </b-modal>
</template>

<style scoped>
.game:hover {
  cursor: none;
}
</style>
