import { Server } from 'socket.io'
import { Player, Direction, PlayerState, PlayerMovement } from './player'
import { GameMap } from './map/game_map'
import { Item } from './items/item'
import { ItemType } from './items/item_type'
const fs = require('node:fs')

const MAP_WIDTH = 100
const MAP_HEIGHT = 100

const ITEMS = {
  invisible_wall: {
    isGround: false,
    isWalkable: false
  },
  default: {
    isGround: true,
    isWalkable: true
  },
  office_floor1: {
    isGround: true,
    isWalkable: true
  },
  office_floor2: {
    isGround: true,
    isWalkable: true
  },
  office_chair1: {
    isGround: false,
    isWalkable: false
  },
  office_chair2: {
    isGround: false,
    isWalkable: false
  },
  office_chair3: {
    isGround: false,
    isWalkable: false
  },
  office_chair4: {
    isGround: false,
    isWalkable: false
  },
  pink_wall: {
    isGround: false,
    isWalkable: false
  },
  pink_wall_start: {
    isGround: false,
    isWalkable: false
  },
  pink_wall_end: {
    isGround: false,
    isWalkable: false
  },
  pink_wall_corner_left: {
    isGround: false,
    isWalkable: false
  },
  pink_wall_corner_right: {
    isGround: false,
    isWalkable: false
  },
  pink_wall_left: {
    isGround: false,
    isWalkable: false
  },
  pink_wall_right: {
    isGround: false,
    isWalkable: false
  },
  pink_wall_corner_bottom_left: {
    isGround: false,
    isWalkable: false
  },
  pink_wall_corner_bottom_right: {
    isGround: false,
    isWalkable: false
  },
  pink_wall_bottom: {
    isGround: false,
    isWalkable: false
  },
  brick_wall: {
    isGround: false,
    isWalkable: false
  },
  brick_wall_start: {
    isGround: false,
    isWalkable: false
  },
  brick_wall_end: {
    isGround: false,
    isWalkable: false
  },
  right_corner_left: {
    isGround: false,
    isWalkable: false
  },
  right_corner_right: {
    isGround: false,
    isWalkable: false
  },
  shadow_corner_left: {
    isGround: true,
    isWalkable: true
  },
  shadow_left: {
    isGround: true,
    isWalkable: true
  },
  shadow_middle: {
    isGround: true,
    isWalkable: true
  },
  shadow_right: {
    isGround: true,
    isWalkable: true
  },
  money_stack: {
    isGround: false,
    isWalkable: true
  },
  company_board_left: {
    isGround: false,
    isWalkable: false
  },
  company_board_right: {
    isGround: false,
    isWalkable: false
  },
  table1_left: {
    isGround: false,
    isWalkable: false
  },
  table1_middle: {
    isGround: false,
    isWalkable: false
  },
  table1_right: {
    isGround: false,
    isWalkable: false
  },
  coffee_machine_left: {
    isGround: false,
    isWalkable: true
  },
  coffee_machine_right: {
    isGround: false,
    isWalkable: true
  },
  air_conditioner_left: {
    isGround: false,
    isWalkable: false
  },
  air_conditioner_right: {
    isGround: false,
    isWalkable: false
  },
  large_table_bottom_corner_left: {
    isGround: false,
    isWalkable: false
  },
  large_table_bottom_middle_left: {
    isGround: false,
    isWalkable: false
  },
  large_table_bottom_middle_right: {
    isGround: false,
    isWalkable: false
  },
  large_table_bottom_corner_right: {
    isGround: false,
    isWalkable: false
  },
  large_table_top_corner_left: {
    isGround: false,
    isWalkable: true
  },
  large_table_top_middle: {
    isGround: false,
    isWalkable: true
  },
  large_table_top_corner_right: {
    isGround: false,
    isWalkable: true
  },
  large_table_middle: {
    isGround: false,
    isWalkable: false
  },
  large_table_bottom_middle: {
    isGround: false,
    isWalkable: false
  },
  cabinet_left: {
    isGround: false,
    isWalkable: true
  },
  cabinet_right: {
    isGround: false,
    isWalkable: true
  },
  vending_machine: {
    isGround: false,
    isWalkable: true
  }
}

const TICK_RATE = 1.0 / 60.0

interface Session {
  id: string
  playerId: string
  username: string
  connected: boolean
}

class World {
  private io: Server
  private sessions: Map<string, Session>
  private map: GameMap
  private players: Map<string, Player>

  constructor(io: Server) {
    this.io = io
    this.players = new Map()
    this.sessions = new Map()
  }

  init() {
    this.setupServer()
    this.loadMap('./map.json')
  }

  mainloop() {
    for (const player of Object.values(this.players)) {
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
      const player = this.players[session.playerId]

      socket.emit('session', {
        sessionId: session.id,
        playerData: player.playerData
      })

      socket.join(`player:${session.playerId}`)

      socket.emit('gameState', this.getGameState(socket))
      socket.broadcast.emit('player:connected', player.playerData)

      socket.on('player:move', (data) => {
        this.handlePlayerMove(socket, data)
      })
      socket.on('player:message', (data) => {
        this.handlePlayerMessage(socket, data)
      })
      socket.on('player:placeItem', (data) => {
        this.handlePlaceItem(socket, data)
      })
      socket.on('player:removeItem', (data) => {
        this.handleRemoveItem(socket, data)
      })
      socket.on('player:changeName', (data) => {
        this.handlePlayerChangeName(socket, data)
      })
      socket.on('disconnect', async () => {
        const matchingSockets = await this.io.in(socket.sessionId).allSockets()
        const isDisconnected = matchingSockets.size === 0

        if (isDisconnected) {
          const session = this.sessions[socket.sessionId]

          if (session) {
            session.connected = false
          }

          socket.broadcast.emit('player:disconnected', player.playerData)
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
        x: 3 * 16,
        y: 3 * 16
      },
      direction: Direction.South,
      state: PlayerState.Idle,
      speed: 50,
      name: socket.username
    })

    const playerMovement = new PlayerMovement(player, this.map)

    player.init(playerMovement)

    player.on('change', (playerData) => {
      this.io.emit('player:change', playerData)
    })

    this.players[player.playerData.id] = player

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
      .filter((session) => session.connected)
      .map((session) => this.players[session.playerId].playerData)

    return {
      players: connectedPlayers,
      map: this.map.toData()
    }
  }

  handlePlayerMove(socket, data) {
    const session = this.sessions[socket.sessionId]

    if (!session) {
      return
    }

    const player = this.players[session.playerId]

    if (!player) {
      return
    }

    const { x, y } = data

    player.movement.moveTo(Math.floor(x / 16), Math.floor(y / 16))
  }

  private loadMap(path) {
    console.log('[ Server ] Loading map...')

    const data = fs.readFileSync(path)

    if (!data) {
      console.error('[ Server ] Error loading map')
      return
    }

    const mapData = JSON.parse(data)

    this.map = new GameMap(mapData.width, mapData.height)
    this.map.init()

    for (let y = 0; y < mapData.height; y++) {
      for (let x = 0; x < mapData.width; x++) {
        const tileData = mapData.tiles[y][x]
        const tile = this.map.getTile(x, y)

        for (const itemData of tileData.items) {
          let itemTypeData = itemData.itemType

          const itemType = new ItemType(itemTypeData.id, itemTypeData)
          const item = new Item(itemType)

          tile.addItem(item)
        }
      }
    }
  }

  private handlePlayerMessage(socket, message) {
    const session = this.sessions[socket.sessionId]

    if (!session) {
      return
    }

    const player = this.players[session.playerId]

    if (!player) {
      return
    }

    this.io.emit('player:message', {
      playerId: player.playerData.id,
      message: message
    })
  }

  private handlePlaceItem(socket, data) {
    console.log('[ Server ] Placing item at', data.x, data.y)

    const tileX = Math.floor(data.x / 16)
    const tileY = Math.floor(data.y / 16)

    if (!this.map.contains(tileX, tileY)) {
      return
    }

    const tile = this.map.getTile(tileX, tileY)

    if (tile.getTopItem()?.getType().getId() === data.itemId) {
      return
    }

    const itemTypeData = ITEMS[data.itemId]
    const itemType = new ItemType(data.itemId, itemTypeData)
    const item = new Item(itemType)

    tile.addItem(item)

    this.io.emit('item:added', {
      x: tileX,
      y: tileY,
      item: item.toData()
    })

    this.notifyMapChange()
  }

  private handleRemoveItem(socket, data) {
    console.log('[ Server ] Removing item at', data.x, data.y)

    const tileX = Math.floor(data.x / 16)
    const tileY = Math.floor(data.y / 16)

    if (!this.map.contains(tileX, tileY)) {
      return
    }

    const tile = this.map.getTile(tileX, tileY)
    const item = tile.removeTopItem()

    if (!item) {
      return
    }

    this.io.emit('item:removed', {
      id: item.getId(),
      x: tileX,
      y: tileY
    })

    this.notifyMapChange()
  }

  private handlePlayerChangeName(socket, name) {
    console.log('[ Server ] Changing player name to', name)

    const session = this.sessions[socket.sessionId]

    if (!session) {
      return
    }

    const player = this.players[session.playerId]

    if (!player) {
      return
    }

    session.username = name
    player.playerData.name = name

    this.io.emit('player:change', player.playerData)
  }

  private notifyMapChange() {
    // this.persistMap()
  }

  private persistMap() {
    console.log('[ Server ] Persisting map...')

    const data = this.map.toData()
    const json = JSON.stringify(data)

    fs.writeFile('map.json', json, (err) => {
      if (err) {
        console.error(`[ Server ] Error saving map: ${err}`)
      }
    })
  }
}

export { World }
