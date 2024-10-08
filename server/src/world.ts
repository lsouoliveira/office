import { Server } from 'socket.io'
import { Player, Direction, PlayerState, PlayerMovement } from './player'
import { GameMap } from './map/game_map'
import { Item } from './items/item'
import { ItemType } from './items/item_type'
import { MoveTask } from './tasks/move_task'
import { SitTask } from './tasks/sit_task'
import { ComputerTask } from './tasks/computer_task'
import { DrinkTask } from './tasks/drink_task'

const fs = require('node:fs')
const crypto = require('crypto')
const DEFAULT_SKIN = 'Bob'

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
    isWalkable: false,
    actionId: 'sit',
    facing: Direction.South
  },
  office_chair2: {
    isGround: false,
    isWalkable: false,
    actionId: 'sit',
    facing: Direction.East
  },
  office_chair3: {
    isGround: false,
    isWalkable: false,
    actionId: 'sit',
    facing: Direction.North
  },
  office_chair4: {
    isGround: false,
    isWalkable: false,
    actionId: 'sit',
    facing: Direction.West
  },
  orange_office_chair1: {
    isGround: false,
    isWalkable: false,
    actionId: 'sit',
    facing: Direction.South
  },
  orange_office_chair2: {
    isGround: false,
    isWalkable: false,
    actionId: 'sit',
    facing: Direction.East
  },
  orange_office_chair3: {
    isGround: false,
    isWalkable: false,
    actionId: 'sit',
    facing: Direction.North
  },
  orange_office_chair4: {
    isGround: false,
    isWalkable: false,
    actionId: 'sit',
    facing: Direction.West
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
  coffee_machine_left_top: {
    isGround: false,
    isWalkable: false,
    actionId: 'drink'
  },
  coffee_machine_left_bottom: {
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
  },
  computer_west_bottom2: {
    isGround: false,
    isWalkable: false
  },
  computer_west_bottom: {
    isGround: false,
    isWalkable: false
  },
  computer_west_top: {
    isGround: false,
    isWalkable: false,
    actionId: 'computer'
  },
  computer_east_bottom2: {
    isGround: false,
    isWalkable: false
  },
  computer_east_bottom: {
    isGround: false,
    isWalkable: false
  },
  computer_east_top: {
    isGround: false,
    isWalkable: false,
    actionId: 'computer'
  },
  laptop_top: {
    isGround: false,
    isWalkable: false
  },
  laptop_bottom: {
    isGround: false,
    isWalkable: false,
    actionId: 'computer'
  },
  plant1: {
    isGround: false,
    isWalkable: true
  },
  plant2: {
    isGround: false,
    isWalkable: true
  },
  plant3: {
    isGround: false,
    isWalkable: true
  },
  plasma_tv: {
    isGround: false,
    isWalkable: false
  },
  corner_table_left_corner: {
    isGround: false,
    isWalkable: false
  },
  corner_table_top_left: {
    isGround: false,
    isWalkable: true
  },
  coner_table_right_corner: {
    isGround: false,
    isWalkable: false
  },
  coner_table_right_top: {
    isGround: false,
    isWalkable: false
  },
  coner_table_top_right_corner_to_left: {
    isGround: false,
    isWalkable: false
  },
  coner_table_top_right_corner: {
    isGround: false,
    isWalkable: true
  },
  coner_table_right_middle: {
    isGround: false,
    isWalkable: false
  },
  phone_top: {
    isGround: false,
    isWalkable: false
  },
  phone_bottom: {
    isGround: false,
    isWalkable: false
  },
  water_cooler_top: {
    isGround: false,
    isWalkable: false,
    actionId: 'drink'
  },
  water_cooler_bottom: {
    isGround: false,
    isWalkable: false
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
      socket.on('player:changeSkin', (data) => {
        this.handlePlayerChangeSkin(socket, data)
      })
      socket.on('player:use', (data) => {
        this.handleUse(socket, data)
      })
      socket.on('player:playNote', (note) => {
        this.handlePlayNote(socket, note)
      })
      socket.on('player:releaseNote', (note) => {
        this.handleReleaseNote(socket, note)
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

          this.handlePlayerDisconnect(socket, player)
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
      name: socket.username,
      skin: DEFAULT_SKIN
    })

    const playerMovement = new PlayerMovement(player, this.map)

    player.init(playerMovement)

    player.on('change', (playerData) => {
      this.io.emit('player:change', playerData)
    })

    player.on('move', ({ x, y, direction }) => {
      this.io.emit('player:move', {
        playerId: player.playerData.id,
        x,
        y,
        direction
      })
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
    const tileX = Math.floor(x / 16)
    const tileY = Math.floor(y / 16)

    const task = new MoveTask(player, [tileX, tileY])

    player.clearTasks()
    player.addTask(task)
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
    if (message.startsWith('/')) {
      this.handleCommand(socket, message)

      return
    }

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

  private handleCommand(socket, message) {
    const parts = message.split(' ')
    const command = parts[0].substring(1)

    if (command === 'admin') {
      const password = parts[1]

      if (password === process.env.ADMIN_PASSWORD) {
        this.handleAdminCommand(socket)

        return
      }
    }

    if (!this.isAdmin(socket)) {
      return
    }

    if (command === 'tp') {
      this.handleTeleportCommand(socket, parts)
    } else if (command == 'tp_player') {
      this.handleTeleportPlayerCommand(socket, parts)
    } else if (command == 'clear_map') {
      this.handleClearMapCommand(socket)
    } else if (command == 'player_speed') {
      this.handlePlayerSpeedCommand(socket, parts)
    }
  }

  private handleAdminCommand(socket) {
    const session = this.sessions[socket.sessionId]

    if (!session) {
      return
    }

    const player = this.players[session.playerId]

    if (!player) {
      return
    }

    player.playerData.isAdmin = true
  }

  private handleTeleportCommand(socket, parts) {
    const session = this.sessions[socket.sessionId]

    if (!session) {
      return
    }

    const player = this.players[session.playerId]

    if (!player) {
      return
    }

    const x = parseInt(parts[1]) * 16
    const y = parseInt(parts[2]) * 16

    player.teleport(x, y)
  }

  private handleTeleportPlayerCommand(socket, parts) {
    const session = this.sessions[socket.sessionId]

    if (!session) {
      return
    }

    const player = this.players[session.playerId]

    if (!player) {
      return
    }

    let playerName = parts.slice(1, parts.length - 2).join(' ')
    playerName = playerName.substring(1, playerName.length - 1)

    const x = parseInt(parts[2]) * 16
    const y = parseInt(parts[3]) * 16

    for (const player of Object.values(this.players)) {
      if (player.playerData.name === playerName) {
        player.teleport(x, y)

        return
      }
    }
  }

  private handleClearMapCommand(socket) {
    if (!this.isAdmin(socket)) {
      return
    }

    for (let y = 0; y < this.map.getHeight(); y++) {
      for (let x = 0; x < this.map.getWidth(); x++) {
        const tile = this.map.getTile(x, y)

        while (!tile.isEmpty()) {
          tile.removeTopItem()
        }
      }
    }
  }

  private handlePlayerSpeedCommand(socket, parts) {
    if (!this.isAdmin(socket)) {
      return
    }

    const session = this.sessions[socket.sessionId]

    if (!session) {
      return
    }

    const player = this.players[session.playerId]

    if (!player) {
      return
    }

    console.log('[ Server ] Changing player speed to', parts[1])

    player.setSpeed(parseInt(parts[1]))
  }

  private handlePlaceItem(socket, data) {
    console.log('[ Server ] Placing item at', data.x, data.y)

    if (!this.isAdmin(socket)) {
      return
    }

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

    if (!this.isAdmin(socket)) {
      return
    }

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

  private handlePlayerChangeSkin(socket, skin) {
    console.log('[ Server ] Changing player skin to', skin)

    const session = this.sessions[socket.sessionId]

    if (!session) {
      return
    }

    const player = this.players[session.playerId]

    if (!player) {
      return
    }

    player.setSkin(skin)
  }

  private handleUse(socket, data) {
    console.log('[ Server ] Using item at', data.x, data.y)

    const session = this.sessions[socket.sessionId]

    if (!session) {
      return
    }

    const player = this.players[session.playerId]

    if (!player) {
      return
    }

    const tileX = Math.floor(data.x / 16)
    const tileY = Math.floor(data.y / 16)

    if (!this.map.contains(tileX, tileY)) {
      return
    }

    const tile = this.map.getTile(tileX, tileY)

    if (tile.isEmpty()) {
      return
    }

    const item = tile.getTopItemWithAction()

    if (!item) {
      return
    }

    this.handleItemUse(socket, player, tile, item)
  }

  private handlePlayNote(socket, note) {
    const session = this.sessions[socket.sessionId]

    if (!session) {
      return
    }

    const player = this.players[session.playerId]

    if (!player) {
      return
    }

    console.log('[ Server ] Playing note', note)

    this.io.emit('player:notePlayed', {
      playerId: player.playerData.id,
      note: note
    })
  }

  private handleReleaseNote(socket, note) {
    const session = this.sessions[socket.sessionId]

    if (!session) {
      return
    }

    const player = this.players[session.playerId]

    if (!player) {
      return
    }

    console.log('[ Server ] Releasing note', note)

    this.io.emit('player:noteReleased', {
      playerId: player.playerData.id,
      note: note
    })
  }

  private handlePlayerDisconnect(socket, player) {
    if (player.isOccupyingItem()) {
      const item = player.getOccupiedItem()

      item.vacate()
    }
  }

  handleItemUse(socket, player, tile, item) {
    console.log('[ Server ] Using item', item.getType().getId())
    console.log('[ Server ] Item action', item.getActionId())

    if (!item.getActionId()) {
      return
    }

    if (item.getActionId() == 'sit') {
      this.performSitAction(socket, player, tile, item)
    } else if (item.getActionId() == 'computer') {
      this.performComputerAction(socket, player, tile)
    } else if (item.getActionId() == 'drink') {
      this.performDrinkAction(socket, player, tile)
    }
  }

  findAvailableNeighbourTile(player, tile) {
    const possibleTileNeighbors = [
      [tile.getX() - 1, tile.getY()],
      [tile.getX() + 1, tile.getY()],
      [tile.getX(), tile.getY() - 1],
      [tile.getX(), tile.getY() + 1],
      [tile.getX() - 1, tile.getY() - 1],
      [tile.getX() + 1, tile.getY() - 1],
      [tile.getX() - 1, tile.getY() + 1],
      [tile.getX() + 1, tile.getY() + 1]
    ]

    possibleTileNeighbors.sort((a, b) => {
      return player.movement.getDistanceTo(a[0], a[1]) - player.movement.getDistanceTo(b[0], b[1])
    })

    for (const neighbourTile of possibleTileNeighbors) {
      if (!this.map.contains(neighbourTile[0], neighbourTile[1])) {
        continue
      }

      if (player.movement.canReach(neighbourTile[0], neighbourTile[1])) {
        return neighbourTile
      }
    }

    return null
  }

  private performSitAction(socket, player, tile, item) {
    player.clearTasks()

    if (player.isOccupyingItem()) {
      const occupiedItem = player.getOccupiedItem()

      occupiedItem.vacate()
    }

    if (!player.movement.isNeighbour(tile.getX(), tile.getY())) {
      const target = this.findAvailableNeighbourTile(player, tile)

      if (!target) {
        return
      }

      const moveTask = new MoveTask(player, [target[0], target[1]])
      player.addTask(moveTask)
    }

    const sitTask = new SitTask(player, item, tile)
    player.addTask(sitTask)
  }

  private performComputerAction(socket, player, tile) {
    player.clearTasks()

    if (!player.movement.isNeighbour(tile.getX(), tile.getY())) {
      const target = this.findAvailableNeighbourTile(player, tile)

      if (!target) {
        return
      }

      const moveTask = new MoveTask(player, [target[0], target[1]])
      player.addTask(moveTask)
    }

    const computerTask = new ComputerTask(socket)
    player.addTask(computerTask)
  }

  private performDrinkAction(socket, player, tile) {
    player.clearTasks()

    if (!player.movement.isNeighbour(tile.getX(), tile.getY())) {
      const target = this.findAvailableNeighbourTile(player, tile)

      if (!target) {
        return
      }

      const moveTask = new MoveTask(player, [target[0], target[1]])
      player.addTask(moveTask)
    }

    const drinkTask = new DrinkTask(player)
    player.addTask(drinkTask)
  }

  private notifyMapChange() {
    this.persistMap()
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

  isAdmin(socket) {
    if (process.env.ADMIN_PASSWORD === undefined) {
      return true
    }

    const session = this.sessions[socket.sessionId]

    if (!session) {
      return false
    }

    const player = this.players[session.playerId]

    if (!player) {
      return false
    }

    return player.playerData.isAdmin
  }
}

export { World }
