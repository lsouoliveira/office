import { Server } from 'socket.io'
import { Player, Direction, PlayerState, PlayerMovement, Equipment, EquipmentType } from './player'
import { GameMap } from './map/game_map'
import { Item } from './items/item'
import { ItemType } from './items/item_type'
import { MoveTask } from './tasks/move_task'
import { SitTask } from './tasks/sit_task'
import { ComputerTask } from './tasks/computer_task'
import { DrinkTask } from './tasks/drink_task'
import { ReplaceItemTask } from './tasks/replace_item_task'
import { EquipTempEquipmentTask } from './tasks/equip_temp_equipment_task'
import { EquipEquipment } from './tasks/equip_equipment_task'
import logger from './logger'

const fs = require('node:fs')
const crypto = require('crypto')
const DEFAULT_SKIN = 'Bob'

const EQUIPMENTS = [
  {
    id: 'ladybug_01',
    type: EquipmentType.Helmet
  },
  {
    id: 'bee_01',
    type: EquipmentType.Helmet
  },
  {
    id: 'snapback_01',
    type: EquipmentType.Helmet
  },
  {
    id: 'snapback_02',
    type: EquipmentType.Helmet
  },
  {
    id: 'snapback_03',
    type: EquipmentType.Helmet
  },
  {
    id: 'snapback_04',
    type: EquipmentType.Helmet
  },
  {
    id: 'snapback_05',
    type: EquipmentType.Helmet
  },
  {
    id: 'dino_snapback_01',
    type: EquipmentType.Helmet
  },
  {
    id: 'policeman_hat_01',
    type: EquipmentType.Helmet
  },
  {
    id: 'bataclava_01',
    type: EquipmentType.Helmet
  },
  {
    id: 'detective_hat_01',
    type: EquipmentType.Helmet
  },
  {
    id: 'zombie_brain_01',
    type: EquipmentType.Helmet
  },
  {
    id: 'bolt_01',
    type: EquipmentType.Helmet
  },
  {
    id: 'beanie_01',
    type: EquipmentType.Helmet
  },
  {
    id: 'mustache_01',
    type: EquipmentType.Helmet
  },
  {
    id: 'beard_01',
    type: EquipmentType.Helmet
  },
  {
    id: 'glasses_01',
    type: EquipmentType.Helmet
  },
  {
    id: 'monocle_01',
    type: EquipmentType.Helmet
  },
  {
    id: 'medical_mask_01',
    type: EquipmentType.Helmet
  },
  {
    id: 'chef_01',
    type: EquipmentType.Helmet
  },
  {
    id: 'party_cone_01',
    type: EquipmentType.Helmet
  },
  {
    id: 'party_cone_04',
    type: EquipmentType.Helmet
  }
]

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
  private items: object

  constructor(io: Server) {
    this.io = io
    this.players = new Map()
    this.sessions = new Map()
  }

  init() {
    this.loadItems()
    this.setupServer()

    if (fs.existsSync('./map.json')) {
      this.loadMap('./map.json')
    } else {
      this.initMap()
    }
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

  private loadItems() {
    logger.info('Loading items...')

    const data = fs.readFileSync('./data/items.json')

    if (!data) {
      console.error('Error loading items')
      return
    }

    this.items = JSON.parse(data)
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

      socket.sessionId = sessionId || crypto.randomUUID()
      socket.username = username

      next()
    })

    this.io.on('connection', (socket) => {
      const session = this.createOrUpdateSession(socket)
      const player = this.players[session.playerId]

      logger.info(`Player ${player?.playerData?.name} connected`)

      socket.emit('session', {
        sessionId: session.id,
        playerData: player.getPlayerData()
      })

      socket.join(`player:${session.playerId}`)

      socket.emit('gameState', this.getGameState(socket))
      socket.broadcast.emit('player:connected', player.getPlayerData())

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
        logger.info(`Player ${player?.playerData?.name} disconnected`)

        const matchingSockets = await this.io.in(socket.sessionId).allSockets()
        const isDisconnected = matchingSockets.size === 0

        if (isDisconnected) {
          const session = this.sessions[socket.sessionId]

          if (session) {
            session.connected = false
          }

          socket.broadcast.emit('player:disconnected', player.getPlayerData())

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
      .map((session) => this.players[session.playerId].getPlayerData())

    return {
      players: connectedPlayers,
      map: this.map.toData()
    }
  }

  async handlePlayerMove(socket, data) {
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

  private initMap() {
    logger.info('Initializing map...')

    this.map = new GameMap(100, 100)
    this.map.init()
  }

  private async handlePlayerMessage(socket, message) {
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

    logger.info(`Player ${player.playerData.name} says: ${message}`)

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
      logger.warn('Teleport command is disabled')
      // this.handleTeleportCommand(socket, parts)
    } else if (command == 'tp_player') {
      // this.handleTeleportPlayerCommand(socket, parts)
    } else if (command == 'clear_map') {
      this.handleClearMapCommand(socket)
    } else if (command == 'player_speed') {
      this.handlePlayerSpeedCommand(socket, parts)
    } else if (command.match(/^a\d+$/)) {
      this.handleEquipItem(socket, command)
    } else {
      this.handlePreset(socket, command)
    }
  }

  private async handlePreset(socket, preset) {
    const session = this.sessions[socket.sessionId]

    if (!session) {
      return
    }

    const player = this.players[session.playerId]

    if (!player) {
      return
    }

    const presetKey = await this.digest(preset?.toLowerCase())
    const presetData = this.loadPreset(presetKey)

    if (!presetData) {
      return
    }

    logger.info(`Applying preset ${preset} to player ${player.playerData.name}`)

    player.setName(presetData.name)
    player.setSkin(presetData.skin)
  }

  private loadPreset(key: string) {
    const preset = process.env[key]

    if (!preset) {
      return
    }

    const parts = preset.split(',')

    return {
      name: parts[0],
      skin: parts[1]
    }
  }

  private async digest(message) {
    const msgBuffer = new TextEncoder().encode(message)
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)

    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  }

  private handlePlayerPreset(socket, preset) {
    const session = this.sessions[socket.sessionId]

    if (!session) {
      return
    }

    const player = this.players[session.playerId]

    if (!player) {
      return
    }

    player.setN
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
        player.clearTasks()
        player.movement.stop()

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

    logger.info(`Setting player speed to ${parts[1]}`)

    try {
      player.setSpeed(parseInt(parts[1]))
    } catch (e) {
      logger.error(`Error setting player speed: ${e}`)
    }
  }

  private handleEquipItem(socket, command) {
    const session = this.sessions[socket.sessionId]

    if (!session) {
      return
    }

    const player = this.players[session.playerId]

    if (!player) {
      return
    }

    const equipmentIndex = parseInt(command.substring(1))

    if (equipmentIndex < 0 || equipmentIndex >= EQUIPMENTS.length) {
      return
    }

    const equipmentId = EQUIPMENTS[equipmentIndex].id
    const equipment = this.createEquipment(equipmentId)

    if (!equipment) {
      return
    }

    this.performEquipEquipment(socket, player, equipment)
  }

  private async handlePlaceItem(socket, data) {
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

    const itemTypeData = this.items[data.itemId]
    const itemType = new ItemType(data.itemId, {
      isGround: itemTypeData.is_ground,
      isWalkable: itemTypeData.is_walkable,
      isWall: itemTypeData.is_wall,
      actionId: itemTypeData.action_id,
      facing: itemTypeData.facing,
      equipmentId: itemTypeData.equipment_id,
      nextItemId: itemTypeData.next_item_id
    })

    const item = new Item(itemType)

    tile.addItem(item)

    this.io.emit('item:added', {
      x: tileX,
      y: tileY,
      item: item.toData()
    })

    this.notifyMapChange()
  }

  private async handleRemoveItem(socket, data) {
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

  private async handlePlayerChangeName(socket, name) {
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

    this.io.emit('player:change', player.getPlayerData())
  }

  private async handlePlayerChangeSkin(socket, skin) {
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

  private async handleUse(socket, data) {
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

  private async handlePlayNote(socket, note) {
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

  private async handleReleaseNote(socket, note) {
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

  private async handlePlayerDisconnect(socket, player) {
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
    } else if (item.getActionId() == 'replaceItem') {
      this.performReplaceItemAction(socket, player, tile, item)
    } else if (item.getActionId() == 'equipTempItem') {
      logger.info(
        `[ Server ] Equipping temporary item ${item.getType().getId()} to player ${player.playerData.name}`
      )

      if (!item.getEquipmentId()) {
        logger.info(`[ Server ] Item ${item.getType().getId()} does not have an equipment id`)
        return
      }

      const equipment = this.createEquipment(item.getEquipmentId())

      if (!equipment) {
        return
      }

      this.performEquipTempEquipment(socket, player, tile, equipment)
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

  private performReplaceItemAction(socket, player, tile, item) {
    player.clearTasks()

    if (!player.movement.isNeighbour(tile.getX(), tile.getY())) {
      const target = this.findAvailableNeighbourTile(player, tile)

      if (!target) {
        return
      }

      const moveTask = new MoveTask(player, [target[0], target[1]])
      player.addTask(moveTask)
    }

    const itemData = this.items[item.getNextItemId()]

    if (!itemData) {
      logger.error(`[ Server ] Item ${item.getNextItemId()} not found`)

      return
    }

    const itemType = new ItemType(item.getNextItemId(), {
      isGround: itemData.is_ground,
      isWalkable: itemData.is_walkable,
      isWall: itemData.is_wall,
      actionId: itemData.action_id,
      facing: itemData.facing,
      equipmentId: itemData.equipment_id,
      nextItemId: itemData.next_item_id
    })

    const newItem = new Item(itemType)

    const replaceItemTask = new ReplaceItemTask(this.io, player, item, tile, newItem)
    player.addTask(replaceItemTask)
  }

  private performEquipTempEquipment(socket, player, tile, equipment) {
    logger.info(
      `[ Server ] Equipping temporary equipment ${equipment.getId()} to player ${player.playerData.name}`
    )

    player.clearTasks()

    if (!player.movement.isNeighbour(tile.getX(), tile.getY())) {
      const target = this.findAvailableNeighbourTile(player, tile)

      if (!target) {
        return
      }

      const moveTask = new MoveTask(player, [target[0], target[1]])
      player.addTask(moveTask)
    }

    const equipTempEquipmentTask = new EquipTempEquipmentTask(player, equipment)
    player.addTask(equipTempEquipmentTask)
  }

  private performEquipEquipment(socket, player, equipment) {
    logger.info(
      `[ Server ] Equipping equipment ${equipment.getId()} to player ${player.playerData.name}`
    )

    player.clearTasks()

    const equipEquipmentTask = new EquipEquipment(player, equipment)
    player.addTask(equipEquipmentTask)
  }

  private notifyMapChange() {
    this.persistMap()
  }

  private persistMap() {
    console.log('[ Server a] Persisting map...')

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

  createEquipment(equipmentId) {
    const equipmentData = EQUIPMENTS.find((equipment) => equipment.id === equipmentId)

    if (!equipmentData) {
      return
    }

    return new Equipment(equipmentId, equipmentData.type)
  }
}

export { World }
