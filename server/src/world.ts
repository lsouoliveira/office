import { Server } from 'socket.io'
import { Player, Direction, PlayerState, PlayerMovement } from './player'
import fs from 'fs'

const TICK_RATE = 1.0 / 60.0

interface GameState {
    players: Map<string, Player>
}

interface Session {
    id: string
    playerId: string
    username: string
    connected: boolean
}

class World {
  private io: Server
  private gameState: GameState
  private sessions: Map<string, Session>
  private collisionMap: number[][]

  constructor(io: Server) {
      this.io = io
      this.gameState = {
          players: new Map()
      }
      this.sessions = new Map()
  }

  init () {
      this.setupServer()
      this.loadCollisionMap("../client/public/resources/maps/playground.json")
  }

  mainloop() {
      for (const player of Object.values(this.gameState.players)) {
          player.update(TICK_RATE)
      }
  }

  start() {
      this.init()

      setInterval(() => {
          this.mainloop()
      }, TICK_RATE * 1000)
  }

  private setupServer() {
      this.io.use(async (socket, next) => {
          const sessionId = socket.handshake.auth.sessionId

          if (sessionId) {
              if (this.sessions[sessionId]) {
                  socket.sessionId = sessionId

                  return next()
              }
          }

          const username = socket.handshake.auth.username

          if (!username) {
              next(new Error('No username'))
          }

          socket.sessionId = crypto.randomUUID()
          socket.username = username

          next()
      })

      this.io.on('connection', (socket) => {
          const session = this.createOrUpdateSession(socket)
          const player = this.gameState.players[session.playerId]

          socket.emit("session", {
              sessionId: session.id,
              playerData: player.playerData
          })

          socket.join(`player:${session.playerId}`)

          socket.emit("gameState", this.getGameState())
          socket.broadcast.emit("player:connected", player.playerData)

          socket.on("player:move", (data) => { this.handlePlayerMove(socket, data) })
          socket.on("player:message", (data) => { this.handlePlayerMessage(socket, data) })
          socket.on('disconnect', async () => {
              const matchingSockets = await this.io.in(socket.sessionId).allSockets()
              const isDisconnected = matchingSockets.size === 0

              if (isDisconnected) {
                  const session = this.sessions[socket.sessionId]

                  if (session) {
                      session.connected = false
                  }

                  socket.broadcast.emit("player:disconnected", player.playerData)
              }
          })
      })
  }

  createOrUpdateSession(socket) {
      const session = this.sessions[socket.sessionId]

      if (session) {
          session.connected = true

          return session
      }

      const player = new Player({
          id: crypto.randomUUID(),
          position: {
              x: 1 * 16,
              y: 3 * 16
          },
          direction: Direction.South,
          state: PlayerState.Idle,
          speed: 30,
          name: socket.username
      })

      const playerMovement = new PlayerMovement(player, this.collisionMap)

      player.init(playerMovement)

      player.on('change', (playerData) => {
          this.io.emit('player:change', playerData)
      })

      this.gameState.players[player.playerData.id] = player

      this.sessions[socket.sessionId] = {
          id: socket.sessionId,
          playerId: player.playerData.id,
          username: socket.username,
          connected: true
      }

      return this.sessions[socket.sessionId]
  }

  getGameState(socket) {
    const connectedPlayers = Object.values(this.sessions)
                                   .filter(session => session.connected)
                                   .map(session => this.gameState.players[session.playerId].playerData)

    return {
      players: connectedPlayers
    }
  }

  handlePlayerMove(socket, data) {
    const session = this.sessions[socket.sessionId]

    if (!session) {
        return
    }

    const player = this.gameState.players[session.playerId]

    if (!player) {
        return
    }

    const { x, y } = data

    player.movement.moveTo(
        Math.floor(x / 16),
        Math.floor(y / 16)
    )
  }

  private loadCollisionMap(path) {
      const data = JSON.parse(fs.readFileSync(path, 'utf8'))
      const collisionLayer = data.layers.find(layer => layer.name === 'collision')
      const collisionMap = []

      for (let i = 0; i < collisionLayer.height; i++) {
          const row = []

          for (let j = 0; j < collisionLayer.width; j++) {
              row.push(collisionLayer.data[i * collisionLayer.width + j] !== 0 ? 1 : 0)
          }

          collisionMap.push(row)
      }

      this.collisionMap = collisionMap
  }

  private handlePlayerMessage(socket, message) {
      const session = this.sessions[socket.sessionId]

      if (!session) {
          return
      }

      const player = this.gameState.players[session.playerId]

      if (!player) {
          return
      }

      this.io.emit("player:message", {
          playerId: player.playerData.id,
          message: message
      })
  }
}

export { World }
