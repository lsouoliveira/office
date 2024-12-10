import { Server } from 'socket.io'
import { Player, Direction, PlayerState, PlayerMovement, Equipment, EquipmentType } from './player'
import { GameMap } from './map/game_map'
import { Item } from './items/item'
import { ItemType } from './items/item_type'
import { MoveTask } from './tasks/move_task'
import { SitTask } from './tasks/sit_task'
import { JukeboxTask } from './tasks/jukebox_task'
import { ComputerTask } from './tasks/computer_task'
import { PingPongTask } from './tasks/ping_pong_task'
import { DrinkTask } from './tasks/drink_task'
import { EatTask } from './tasks/eat_task'
import { ReplaceItemTask } from './tasks/replace_item_task'
import { EquipTempEquipmentTask } from './tasks/equip_temp_equipment_task'
import { ClaimRewardTask } from './tasks/claim_reward_task'
import { EquipEquipment } from './tasks/equip_equipment_task'
import { Inventory } from './inventory/inventory'
import logger from './logger'
import * as cron from 'node-cron'
import { HelloWorldAction } from './actions/hello_world_action'
import { GetPlayerInventoryAction } from './actions/get_player_inventory_action'
import { GetPlayerAction } from './actions/get_player_action'
import { EquipItemAction } from './actions/equip_item_action'
import { UnequipItemAction } from './actions/unequip_item_action'
import { GetShopAction } from './actions/get_shop_action'
import { BuyItemAction } from './actions/buy_item_action'
import { LotterySystem } from './lottery/lottery_system'
import { GetPlayerLotteryTicketAction } from './actions/get_player_lottery_ticket_action'
import { GetLastLotteryResultsAction } from './actions/get_last_lottery_results_action'
import { BuyLotteryTicketAction } from './actions/buy_lottery_ticket_action'
import { GetNextLotteryAction } from './actions/get_next_lottery_action'
import { PlayJukeboxAction } from './actions/play_jukebox_action'
import RewardSpawnerSystem from './rewards/reward_spawner_system'
import Reward from './rewards/reward'
import SpawnZone from './rewards/spawn_zone'
import { getSpellData, spellExists } from './spells/spells'
import SpellSystem from './spells/spell_system'
import ProjectileSystem from './projectiles/projectile_system'
import { Jukebox, SheetParser } from './jukebox/jukebox'
import { TILE_SIZE } from './config'

import jsonwebtoken from 'jsonwebtoken'
import { db } from './db'
import { usersTable } from './db/schema'
import { eq } from 'drizzle-orm'

const fs = require('node:fs')
const crypto = require('crypto')
const DEFAULT_SKIN = 'Bob'
const REWARD_AMOUNT = 10

enum Level {
  INFO,
  WARNING,
  DANGER
}

enum MessageColor {
  YELLOW = 'yellow',
  GRAY = 'gray',
  GREEN = 'green',
  BLUE = 'blue'
}

const EQUIPMENTS = [
  {
    id: 'ladybug_01',
    type: EquipmentType.Helmet,
    hideHair: false
  },
  {
    id: 'bee_01',
    type: EquipmentType.Helmet,
    hideHair: false
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
    id: 'snapback_mclaren',
    type: EquipmentType.Helmet
  },
  {
    id: 'snapback_nacional',
    type: EquipmentType.Helmet
  },
  {
    id: 'helmet',
    type: EquipmentType.Helmet
  },
  {
    id: 'santa_hat',
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
    type: EquipmentType.Helmet,
    hideHair: false
  },
  {
    id: 'bolt_01',
    type: EquipmentType.Helmet,
    hideHair: false
  },
  {
    id: 'beanie_01',
    type: EquipmentType.Helmet
  },
  {
    id: 'mustache_01',
    type: EquipmentType.FaceMask
  },
  {
    id: 'beard_01',
    type: EquipmentType.FaceMask
  },
  {
    id: 'glasses_01',
    type: EquipmentType.Glasses
  },
  {
    id: 'monocle_01',
    type: EquipmentType.Glasses
  },
  {
    id: 'medical_mask_01',
    type: EquipmentType.FaceMask
  },
  {
    id: 'chef_01',
    type: EquipmentType.Helmet,
    hideHair: false
  },
  {
    id: 'party_cone_01',
    type: EquipmentType.Helmet,
    hideHair: false
  },
  {
    id: 'party_cone_04',
    type: EquipmentType.Helmet,
    hideHair: false
  },
  {
    id: 'wooden_wand',
    type: EquipmentType.Wand
  },
  {
    id: 'willow_wand',
    type: EquipmentType.Wand
  },
  {
    id: 'holly_wand',
    type: EquipmentType.Wand
  },
  {
    id: 'walnut_wand',
    type: EquipmentType.Wand
  },
  {
    id: 'yew_wand',
    type: EquipmentType.Wand
  },
  {
    id: 'oak_wand',
    type: EquipmentType.Wand
  }
]

const ACTION_HANDLER = {
  helloWorld: HelloWorldAction,
  getPlayerInventory: GetPlayerInventoryAction,
  getPlayer: GetPlayerAction,
  equipItem: EquipItemAction,
  unequipItem: UnequipItemAction,
  getShop: GetShopAction,
  buyItem: BuyItemAction,
  getPlayerLotteryTicket: GetPlayerLotteryTicketAction,
  getLastLotteryResults: GetLastLotteryResultsAction,
  buyLotteryTicket: BuyLotteryTicketAction,
  getNextLottery: GetNextLotteryAction,
  playJukebox: PlayJukeboxAction
}

const spawnPoints = [
  { start: { x: 4, y: 4 }, end: { x: 7, y: 8 } },
  { start: { x: 8, y: 6 }, end: { x: 8, y: 8 } },
  { start: { x: 2, y: 9 }, end: { x: 24, y: 9 } },
  { start: { x: 16, y: 4 }, end: { x: 16, y: 8 } },
  { start: { x: 9, y: 4 }, end: { x: 16, y: 4 } },
  { start: { x: 16, y: 8 }, end: { x: 22, y: 8 } },
  { start: { x: 19, y: 13 }, end: { x: 24, y: 13 } },
  { start: { x: 24, y: 13 }, end: { x: 24, y: 18 } },
  { start: { x: 18, y: 18 }, end: { x: 24, y: 18 } },
  { start: { x: 18, y: 16 }, end: { x: 18, y: 17 } },
  { start: { x: 19, y: 17 }, end: { x: 19, y: 17 } },
  { start: { x: 21, y: 16 }, end: { x: 21, y: 17 } },
  { start: { x: 22, y: 17 }, end: { x: 22, y: 17 } },
  { start: { x: 9, y: 13 }, end: { x: 9, y: 18 } },
  { start: { x: 9, y: 18 }, end: { x: 16, y: 18 } },
  { start: { x: 16, y: 13 }, end: { x: 16, y: 18 } },
  { start: { x: 2, y: 4 }, end: { x: 2, y: 6 } },
  { start: { x: 7, y: 13 }, end: { x: 7, y: 16 } },
  { start: { x: 2, y: 16 }, end: { x: 3, y: 16 } },
  { start: { x: 5, y: 16 }, end: { x: 7, y: 16 } }
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
  private lotterySystem: LotterySystem
  private rewardSpawnerSystem: RewardSpawnerSystem
  private spellSystem: SpellSystem
  private projectileSystem: ProjectileSystem
  private jukebox: Jukebox

  constructor(io: Server) {
    this.io = io
    this.players = new Map()
    this.sessions = new Map()
    this.lotterySystem = new LotterySystem(this, 500)
    this.rewardSpawnerSystem = new RewardSpawnerSystem(
      this,
      this.handleRewardSpawned.bind(this),
      this.handleRewardClaimed.bind(this),
      this.handleRewardExpired.bind(this)
    )
    this.spellSystem = new SpellSystem(this)
    this.projectileSystem = new ProjectileSystem(this)
    this.jukebox = new Jukebox(this.io)

    for (const spawnPoint of spawnPoints) {
      const x = spawnPoint.start.x
      const y = spawnPoint.start.y
      const width = spawnPoint.end.x - spawnPoint.start.x
      const height = spawnPoint.end.y - spawnPoint.start.y

      this.rewardSpawnerSystem.addSpawnZone(new SpawnZone(x, y, width, height))
    }
  }

  init() {
    this.loadItems()
    this.setupServer()

    if (fs.existsSync('./map.json')) {
      this.loadMap('./map.json')
    } else {
      this.initMap()
    }

    this.loadServer()
    this.scheduleServerSave()
    this.scheduleRecurrentTasks()
  }

  mainloop(dt: number) {
    for (const player of Object.values(this.players)) {
      player.update(TICK_RATE)
    }

    this.rewardSpawnerSystem.update(TICK_RATE)
    this.projectileSystem.update(TICK_RATE)
    this.jukebox.update(TICK_RATE)
  }

  start() {
    this.init()

    setInterval(() => {
      this.mainloop(TICK_RATE)
    }, TICK_RATE * 1000)
  }

  getPlayers() {
    return this.players
  }

  getOnlinePlayers() {
    const players = Object.values(this.sessions)
      .filter((session) => session.connected)
      .map((session) => this.players[session.playerId])

    return [...new Set(players)]
  }

  getPlayerBySessionId(sessionId: string) {
    const session = this.sessions[sessionId]

    if (!session) {
      return
    }

    return this.players[session.playerId]
  }

  private sendAnnounment(level: Level, message: string) {
    this.io.emit('world:announcement', {
      message,
      level
    })
  }

  private scheduleServerSave() {
    setInterval(
      () => {
        this.saveServer()
      },
      5 * 60 * 1000
    )
  }

  private scheduleRecurrentTasks() {
    cron.schedule('*/10 * * * *', () => {
      this.giveMoneyToPlayers()
    })

    cron.schedule('0 14 * * *', () => {
      this.sendAnnounment(Level.INFO, 'Falta 1 hora para o sorteio da loteria!')
    })

    cron.schedule('30 14 * * *', () => {
      this.sendAnnounment(Level.INFO, 'Faltam 30 minutos para o sorteio da loteria!')
    })

    cron.schedule('00 15 * * *', () => {
      this.drawLotteryWinner()
    })
  }

  private async giveMoneyToPlayers() {
    const activeSessions = Object.values(this.sessions).filter((session) => session.connected)
    const players = activeSessions.map((session) => this.players[session.playerId])
    const uniquePlayers = [...new Set(players)]

    for (const player of uniquePlayers) {
      player.addMoney(REWARD_AMOUNT)
    }
  }

  private async drawLotteryWinner() {
    await this.lotterySystem.drawWinner()
    const results = await this.lotterySystem.getLastNthResults(1)
    let winners = ''

    if (results.length === 0) {
      return
    }

    const result = results[0]

    if (result.winners.length > 0) {
      const winnerNames = result.winners.map((winner) => winner.player_name).join(', ')

      winners = `e ${result.winners.length > 1 ? 'os vencedores foram' : 'o vencedor foi'} ${winnerNames}.`
    } else {
      winners = 'e não houve vencedores.'
    }

    this.sendAnnounment(
      Level.INFO,
      `Resultado da loteria do dia ${new Date().toLocaleDateString()}:`
    )

    setTimeout(() => {
      this.sendAnnounment(Level.INFO, `O número sorteado foi ${result.number} ${winners}`)
    }, 10000)
  }

  private async saveServer() {
    logger.info('Saving server...')

    const data = {
      players: Object.values(this.players).map((player) => ({
        player: player.getPlayerData(),
        inventory: player.getInventory().serialize()
      }))
    }

    const json = JSON.stringify(data)

    fs.writeFile('./server.json', json, (err) => {
      if (err) {
        console.error('Error saving server:', err)
      }
    })
  }

  private loadServer() {
    logger.info('Loading server...')

    if (!fs.existsSync('./server.json')) {
      return
    }

    const data = fs.readFileSync('./server.json')

    if (!data) {
      console.error('Error loading server')
      return
    }

    const serverData = JSON.parse(data)

    for (const playerData of serverData.players) {
      const playerObject = playerData.player
      const inventoryData = playerData.inventory

      const { helmetSlot, glassesSlot, faceMaskSlot, rightHandSlot, ...data } = playerObject
      const helmetSlotItem = helmetSlot ? this.createItemFromData(helmetSlot) : null
      const glassesSlotItem = glassesSlot ? this.createItemFromData(glassesSlot) : null
      const faceMaskSlotItem = faceMaskSlot ? this.createItemFromData(faceMaskSlot) : null
      const rightHandSlotItem = rightHandSlot ? this.createItemFromData(rightHandSlot) : null

      const player = new Player({
        helmetSlot: helmetSlotItem,
        glassesSlot: glassesSlotItem,
        faceMaskSlot: faceMaskSlotItem,
        rightHandSlot: rightHandSlotItem,
        ...data
      })
      const playerMovement = new PlayerMovement(player, this.map)

      for (const inventoryItem of inventoryData) {
        const item = this.createItemFromData(inventoryItem.item)

        if (item) {
          player.getInventory().addItem(item)
        }
      }

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
    }
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
      const accessToken = socket.handshake.auth.token

      if (!accessToken) {
        return next(new Error('No token'))
      }

      try {
        const { id } = jsonwebtoken.decode(accessToken) as { id: number }

        const sessionId = socket.handshake.auth.sessionId

        socket.sessionId = sessionId || crypto.randomUUID()
        socket.userId = id

        next()
      } catch (error) {
        return next(new Error('Invalid token'))
      }
    })

    this.io.on('connection', async (socket) => {
      const session = await this.createOrUpdateSession(socket)
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
      socket.on('player:playEmote', (emoteId: string) => {
        this.handlePlayEmote(socket, emoteId)
      })
      socket.on('actionCall', ({ requestId, action, data }) => {
        this.handleActionCall(socket, requestId, action, data)
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

  async createOrUpdateSession(socket) {
    const session = this.sessions[socket.sessionId]

    if (session) {
      session.connected = true

      return session
    }

    const user = await this.getUser(socket)

    if (!user) {
      logger.error(`User ${socket.userId} not found`)

      const players = Object.values(this.players).filter(
        (player) => player.playerData.userId === socket.userId
      )

      delete this.sessions[socket.sessionId]

      players.forEach((player) => {
        delete this.players[player.playerData.id]
      })

      throw new Error('User not found')
    }

    const player = this.findOrCreatePlayerByUser(user)

    this.sessions[socket.sessionId] = {
      id: socket.sessionId,
      playerId: player.playerData.id,
      username: player.playerData.name,
      connected: true
    }

    return this.sessions[socket.sessionId]
  }

  findOrCreatePlayerByUser(user) {
    const foundPlayer = Object.values(this.players).find(
      (player) => player.playerData.userId === user.id
    )

    if (foundPlayer) {
      return foundPlayer
    }

    const player = new Player({
      id: crypto.randomUUID(),
      position: {
        x: 3 * TILE_SIZE,
        y: 3 * TILE_SIZE
      },
      direction: Direction.South,
      state: PlayerState.Idle,
      speed: 250,
      name: user.name,
      skin: DEFAULT_SKIN,
      userId: user.id,
      money: 0,
      inventory: new Inventory()
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

    return player
  }

  async getUser(socket) {
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, socket.userId))
      .execute()

    if (!user.length) {
      return null
    }

    return user[0]
  }

  getGameState(socket) {
    const connectedPlayers = Object.values(this.sessions)
      .filter((session) => session.connected)
      .map((session) => this.players[session.playerId].getPlayerData())

    return {
      players: connectedPlayers,
      map: this.map.toData(),
      currentTrack: this.jukebox.getCurrentTrack()
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
    const tileX = Math.floor(x / TILE_SIZE)
    const tileY = Math.floor(y / TILE_SIZE)

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

          if (itemTypeData.actionId == 'claimReward') {
            continue
          }

          const equipment = this.createEquipment(itemTypeData.equipmentId)
          const itemType = new ItemType(itemTypeData.id, itemTypeData, equipment)
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

    if (spellExists(message)) {
      const spellData = getSpellData(message)
      this.handleSpell(socket, spellData)

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

    if (message.toLowerCase() === 'voldemort') {
      this.io.emit('player:message', {
        playerId: player.playerData.id,
        message: '*He who must not be named*',
        compact: true,
        color: MessageColor.GRAY
      })
      return
    }

    logger.info(`Player ${player.playerData.name} says: ${message}`)

    this.io.emit('player:message', {
      playerId: player.playerData.id,
      message: message
    })
  }

  private async handleCommand(socket, message) {
    const parts = message.split(' ')
    const command = parts[0].substring(1)

    if (command === 'admin') {
      const password = parts[1]

      if (password === process.env.ADMIN_PASSWORD) {
        this.handleAdminCommand(socket)

        return
      }
    }

    if (command == 'player_speed') {
      this.handlePlayerSpeedCommand(socket, parts)

      return
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
    } else if (command == 'skip') {
      this.jukebox.skip()
    } else if (command.match(/^a\d+$/)) {
      // this.handleEquipItem(socket, command)
    } else {
      this.handlePreset(socket, command)
    }
  }

  private async handleSpell(socket, spellData) {
    const session = this.sessions[socket.sessionId]

    if (!session) {
      return
    }

    const player = this.players[session.playerId]

    if (!player) {
      return
    }

    if (!player.canCastSpell(spellData.id)) {
      this.io.emit('player:message', {
        playerId: player.playerData.id,
        message: '*puff*',
        color: MessageColor.GRAY,
        compact: true
      })

      return
    }

    logger.info(`Casting spell ${spellData.id} by player ${player.playerData.name}`)

    this.spellSystem.cast(player, spellData.id)
    this.io.emit('player:message', {
      playerId: player.playerData.id,
      message: `*${spellData.spelling}*`,
      color: MessageColor.GREEN,
      compact: true
    })
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

    const x = parseInt(parts[1]) * TILE_SIZE
    const y = parseInt(parts[2]) * TILE_SIZE

    player.teleport(x, y)
  }

  private handleTeleportPlayerCommand(socket, parts) {
    const session = this.sessions[socket.sessionId]

    if (!session) {
      return
    }

    const admin = this.players[session.playerId]

    if (!admin) {
      return
    }

    if (parts.length <= 1) {
      return
    }

    let playerName = parts[1]
    playerName = playerName.substring(1, playerName.length - 1)

    for (const player of Object.values(this.players)) {
      if (player.playerData.name === playerName) {
        player.clearTasks()
        player.teleport(TILE_SIZE * admin.movement.gridX(), TILE_SIZE * admin.movement.gridY())

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

    const tileX = Math.floor(data.x / TILE_SIZE)
    const tileY = Math.floor(data.y / TILE_SIZE)

    if (!this.map.contains(tileX, tileY)) {
      return
    }

    const tile = this.map.getTile(tileX, tileY)

    if (tile.getTopItem()?.getType().getId() === data.itemId) {
      return
    }

    const itemTypeData = this.items[data.itemId]
    const equipment = this.createEquipment(itemTypeData.equipment_id)
    const itemType = new ItemType(
      data.itemId,
      {
        isGround: itemTypeData.is_ground,
        isWalkable: itemTypeData.is_walkable,
        isWall: itemTypeData.is_wall,
        actionId: itemTypeData.action_id,
        facing: itemTypeData.facing,
        nextItemId: itemTypeData.next_item_id,
        description: itemTypeData.description,
        isDoor: itemTypeData.is_door
      },
      equipment
    )

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

    const tileX = Math.floor(data.x / TILE_SIZE)
    const tileY = Math.floor(data.y / TILE_SIZE)

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

    const tileX = Math.floor(data.x / TILE_SIZE)
    const tileY = Math.floor(data.y / TILE_SIZE)

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

  private async handlePlayEmote(socket, emoteId) {
    const session = this.sessions[socket.sessionId]

    if (!session) {
      return
    }

    const player = this.players[session.playerId]

    if (!player) {
      return
    }

    console.log('[ Server ] Playing emoteId', emoteId)

    this.io.emit('player:emotePlayed', {
      playerId: player.playerData.id,
      emoteId: emoteId
    })
  }

  private async handleActionCall(socket, requestId, action, data) {
    const response = await this.performAction(socket, action, data)

    socket.emit('actionResponse', {
      requestId,
      response
    })
  }

  private async performAction(socket, action, data) {
    logger.info(`[ Server ] Performing action ${action}`)

    const actionHandlerClass = ACTION_HANDLER[action]

    if (!actionHandlerClass) {
      logger.error(`[ Server ] Action ${action} not found`)

      return {
        status: 404,
        body: 'Action not found'
      }
    }

    const actionHandler = new actionHandlerClass(this, socket, data)

    try {
      logger.info(`[ Server ] Handling action ${action}`)
      logger.info(`[ Server ] Data: ${JSON.stringify(data)}`)

      const response = await actionHandler.handle()

      return response
    } catch (e) {
      logger.error(`[ Server ] Error handling action ${action}: ${e.message}`)

      return {
        status: 500,
        body: e.message
      }
    }
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
    } else if (item.getActionId() == 'jukebox') {
      this.performJukeboxAction(socket, player, tile, item)
    } else if (item.getActionId() == 'computer') {
      this.performComputerAction(socket, player, tile)
    } else if (item.getActionId() == 'ping_pong') {
      this.performPingPongAction(socket, player, tile)
    } else if (item.getActionId() == 'drink') {
      this.performDrinkAction(socket, player, tile)
    } else if (item.getActionId() == 'eat') {
      this.performEatAction(socket, player, tile)
    } else if (item.getActionId() == 'replaceItem') {
      this.performReplaceItemAction(socket, player, tile, item)
    } else if (item.getActionId() == 'claimReward') {
      this.performClaimRewardAction(socket, player, tile, item)
    } else if (item.getActionId() == 'inspect') {
      this.performInspectAction(socket, item)
    } else if (item.getActionId() == 'equipTempItem') {
      logger.info(
        `[ Server ] Equipping temporary item ${item.getType().getId()} to player ${player.playerData.name}`
      )

      if (!item.getEquipmentId()) {
        logger.info(`[ Server ] Item ${item.getType().getId()} does not have an equipment id`)
        return
      }

      const equipment = this.createEquipment(item.getEquipmentId())
      const itemType = new ItemType(
        item.getType().getId(),
        {
          isGround: item.getType().isGround(),
          isWalkable: item.getType().isWalkable(),
          isWall: item.getType().isWall(),
          actionId: item.getType().getActionId(),
          facing: item.getType().getFacing(),
          nextItemId: item.getType().getNextItemId(),
          description: item.getType().getDescription(),
          isDoor: item.getType().isDoor()
        },
        equipment
      )
      const newItem = new Item(itemType)

      if (!equipment) {
        return
      }

      this.performEquipTempEquipment(socket, player, tile, item)
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

  private performJukeboxAction(socket, player, tile, item) {
    player.clearTasks()

    if (!player.movement.isNeighbour(tile.getX(), tile.getY())) {
      const target = this.findAvailableNeighbourTile(player, tile)

      if (!target) {
        return
      }

      const moveTask = new MoveTask(player, [target[0], target[1]])
      player.addTask(moveTask)
    }

    const jukeboxTask = new JukeboxTask(socket)
    player.addTask(jukeboxTask)
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

  private performPingPongAction(socket, player, tile) {
    player.clearTasks()

    if (!player.movement.isNeighbour(tile.getX(), tile.getY())) {
      const target = this.findAvailableNeighbourTile(player, tile)

      if (!target) {
        return
      }

      const moveTask = new MoveTask(player, [target[0], target[1]])
      player.addTask(moveTask)
    }

    const pingPongTask = new PingPongTask(socket)
    player.addTask(pingPongTask)
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

  private performEatAction(socket, player, tile) {
    player.clearTasks()

    if (!player.movement.isNeighbour(tile.getX(), tile.getY())) {
      const target = this.findAvailableNeighbourTile(player, tile)

      if (!target) {
        return
      }

      const moveTask = new MoveTask(player, [target[0], target[1]])
      player.addTask(moveTask)
    }

    const eatTask = new EatTask(player)
    player.addTask(eatTask)
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

    const equipment = this.createEquipment(itemData.equipment_id)
    const itemType = new ItemType(
      item.getNextItemId(),
      {
        isGround: itemData.is_ground,
        isWalkable: itemData.is_walkable,
        isWall: itemData.is_wall,
        actionId: itemData.action_id,
        facing: itemData.facing,
        nextItemId: itemData.next_item_id,
        description: itemData.description,
        isDoor: itemData.is_door
      },
      equipment
    )

    const newItem = new Item(itemType)

    const replaceItemTask = new ReplaceItemTask(this.io, player, item, tile, newItem)
    player.addTask(replaceItemTask)
  }

  private async performClaimRewardAction(socket, player, tile, item) {
    player.clearTasks()

    if (!player.movement.isNeighbour(tile.getX(), tile.getY())) {
      const target = this.findAvailableNeighbourTile(player, tile)

      if (!target) {
        return
      }

      const moveTask = new MoveTask(player, [target[0], target[1]])
      player.addTask(moveTask)
    }

    const claimRewardTask = new ClaimRewardTask(this, player, item.getId())
    player.addTask(claimRewardTask)
  }

  private async performInspectAction(socket: any, item: Item) {
    socket.emit('item:inspect', {
      itemId: item.getId(),
      description: item.getDescription()
    })
  }

  private performEquipTempEquipment(socket, player, tile, item) {
    logger.info(
      `[ Server ] Equipping temporary equipment ${item.getEquipmentId()} to player ${player.playerData.name}`
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

    const equipTempEquipmentTask = new EquipTempEquipmentTask(player, item)
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

  private async handleRewardSpawned(reward: Reward) {
    logger.info(`[ Server ] Reward spawned: ${reward.Id}`)

    this.map.getTile(reward.X, reward.Y).addItem(reward.Item)

    this.io.emit('item:added', {
      x: reward.X,
      y: reward.Y,
      item: reward.Item.toData()
    })
  }

  private async handleRewardClaimed(playerId: string, reward: Reward) {
    const player = this.players[playerId]

    if (!player) {
      return
    }

    player.addMoney(reward.Amount)

    const tile = this.map.getTile(reward.X, reward.Y)

    tile.removeItem(reward.Item)

    this.io.emit('item:removed', {
      id: reward.Item.getId(),
      x: reward.X,
      y: reward.Y
    })

    logger.info(`[ Server ] Reward claimed: ${reward.Id} by player ${playerId}`)
  }

  private async handleRewardExpired(reward: Reward) {
    logger.info(`[ Server ] Reward expired: ${reward.Id}`)

    this.map.getTile(reward.X, reward.Y).removeItem(reward.Item)

    this.io.emit('item:removed', {
      id: reward.Item.getId(),
      x: reward.X,
      y: reward.Y
    })
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
    if (!equipmentId) {
      return
    }

    const equipmentData = EQUIPMENTS.find((equipment) => equipment.id === equipmentId)

    if (!equipmentData) {
      return
    }

    const hideHair = equipmentData.hideHair === undefined ? true : equipmentData.hideHair

    return new Equipment(equipmentId, equipmentData.type, hideHair)
  }

  getItemById(id) {
    return this.items[id]
  }

  getPlayerById(id) {
    return this.players[id]
  }

  createItemFromData(data) {
    if (!data) {
      return null
    }

    const equipment = this.createEquipment(data.itemType.equipmentId)
    const itemType = new ItemType(data.itemType.id, data.itemType, equipment)
    const item = new Item(itemType, data.id)

    return item
  }

  getLotterySystem() {
    return this.lotterySystem
  }

  getRewardSpawnerSystem() {
    return this.rewardSpawnerSystem
  }

  getSpellSystem() {
    return this.spellSystem
  }

  getProjectileSystem() {
    return this.projectileSystem
  }

  getMap() {
    return this.map
  }

  sendMessage(message, data) {
    this.io.emit(message, data)
  }

  playJukebox(requesterId: string, musicSheet: string) {
    logger.info(`Player ${requesterId} is playing the jukebox`)

    this.jukebox.play(requesterId, musicSheet)
  }
}

export { World }
