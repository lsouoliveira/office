import * as PIXI from 'pixi.js'
import { Assets, Sprite, Spritesheet, AnimatedSprite } from 'pixi.js'
import { Scene } from './scene'
import { Camera } from './../camera'
import { Client } from './../client'
import { Animator } from './../animation/animator'
import { Animation } from './../animation/animation'
import { Player, Direction } from './../characters/player'
import { GameMap } from './../map/game_map'
import { Tile } from './../map/tile'
import { ItemType } from './../items/item_type'
import { Item } from './../items/item'
import { SPRITES } from './../data/sprites'
import { Cursor } from './../cursor'
import { SpriteCursor } from './../sprite_cursor'
import { Stats } from 'pixi-stats'
import { Chat } from './../entities/chat'
import { Equipment, EquipmentType } from './../characters/player'

const TILE_SIZE = 16
const DEFAULT_SKIN = 'Bob'

const SKINS = [
  {
    name: 'Bob',
    sprite: 'Bob_16x16.png'
  },
  {
    name: 'Alex',
    sprite: 'Alex_16x16.png'
  },
  {
    name: 'Amelia',
    sprite: 'Amelia_16x16.png'
  },
  {
    name: 'Adam',
    sprite: 'Adam_16x16.png'
  }
]

const EQUIPMENTS = [
  {
    id: 'party_cone_04',
    type: EquipmentType.Helmet,
    sprite: 'party_cone_04.png'
  }
]

class Playground extends Scene {
  private camera: Camera
  private player: Player
  private players: Map<string, Player> = new Map()
  private client: Client
  private playerSpritesheet: Spritesheet
  private entities: any[] = []
  private map: GameMap
  private entitiesLayer: PIXI.Container = new PIXI.Container()
  private uiLayer: PIXI.Container = new PIXI.Container()
  private cursor: Cursor
  private spriteCursor: SpriteCursor
  private isPlacingItem: boolean = false
  private ctrlPressed: boolean = false
  private chat: Chat
  private spritesheets: Map<string, Spritesheet> = new Map()
  private equipmentSpritesheets: Map<string, Spritesheet> = new Map()

  async onStart() {
    // const stats = new Stats(this.app.renderer)

    this.entitiesLayer.sortableChildren = true

    SKINS.forEach(({ name, sprite }) => {
      this.spritesheets.set(
        name,
        new Spritesheet(Assets.get(sprite), Assets.get('default_spritesheet.json').data)
      )
    })

    for (const spritesheet of this.spritesheets.values()) {
      await spritesheet.parse()
    }

    EQUIPMENTS.forEach(({ id, type, sprite }) => {
      this.equipmentSpritesheets.set(
        id,
        new Spritesheet(Assets.get(sprite), Assets.get('default_spritesheet.json').data)
      )
    })

    for (const spritesheet of this.equipmentSpritesheets.values()) {
      await spritesheet.parse()
    }

    this.camera = new Camera(this)
    this.camera.scale = Math.min(
      window.innerWidth / (TILE_SIZE * 32),
      window.innerHeight / (TILE_SIZE * 18)
    )

    this.connectToServer()
  }

  update() {
    for (const entity of this.entities) {
      entity.updateEntity(this.app.ticker.deltaMS / 1000)
    }

    if (this.player) {
      this.camera.centerAt(
        this.player.position.x + this.player.width / 2,
        this.player.position.y + this.player.height / 2
      )
    }

    this.camera.update()

    this.reorderEntitiesLayer()
  }

  setupMapBuilder() {
    this.spriteCursor = new SpriteCursor(this.map)

    this.uiLayer.addChild(this.spriteCursor)
  }

  connectToServer() {
    const credentials = {
      username: (localStorage.getItem('username') || 'Sem nome').substring(0, 32),
      sessionId: localStorage.getItem('sessionId')
    }

    this.client = new Client('ws://localhost:3000', credentials)
    this.client.socket.on('connect', () => {
      this.client.socket.on('session', this.handleSession.bind(this))
      this.client.socket.on('player:connected', this.handlePlayerConnected.bind(this))
      this.client.socket.on('player:disconnected', this.handlePlayerDisconnected.bind(this))
      this.client.socket.on('player:change', this.handlePlayerChange.bind(this))
      this.client.socket.on('player:message', this.handlePlayerMessage.bind(this))
      this.client.socket.on('player:move', this.handlePlayerMove.bind(this))
      this.client.socket.on('player:notePlayed', this.handleNotePlayed.bind(this))
      this.client.socket.on('player:noteReleased', this.handleNoteReleased.bind(this))
      this.client.socket.on('computer:open', this.handleComputerOpen.bind(this))
      this.client.socket.on('item:added', this.handleItemAdded.bind(this))
      this.client.socket.on('item:removed', this.handleItemRemoved.bind(this))
      this.client.socket.on('gameState', this.handleGameState.bind(this))
    })
  }

  setupScene() {
    this.addChild(this.entitiesLayer)
    this.addChild(this.uiLayer)

    this.app.stage.on('pointermove', this.onMouseMove.bind(this))
    this.app.stage.on('click', this.onClick.bind(this))

    window.addEventListener('ui:send_message', this.handleSendMessage.bind(this))
    window.addEventListener('ui:select_item', this.handleSelectItem.bind(this))
    window.addEventListener('ui:clear_selection', this.handleClearSelection.bind(this))
    window.addEventListener('ui:config', this.handleConfig.bind(this))
    window.addEventListener('ui:note_press', this.handleNotePress.bind(this))
    window.addEventListener('ui:note_release', this.handleNoteRelease.bind(this))
    window.addEventListener('keydown', this.handleKeyDown.bind(this))
    window.addEventListener('keyup', this.handleKeyUp.bind(this))

    this.chat = new Chat({ maxMessages: 15 })
    this.chat.position.set(8, 8)

    this.app.stage.addChild(this.chat)
    this.addEntity(this.chat)
  }

  setupMap(mapData) {
    this.map = new GameMap(mapData.width, mapData.height)
    this.map.init()

    for (let i = 0; i < this.map.getHeight(); i++) {
      for (let j = 0; j < this.map.getWidth(); j++) {
        const tileData = mapData.tiles[i][j]
        const tile = new Tile(j, i)

        for (const itemData of tileData.items) {
          const itemTypeData = itemData.itemType
          let itemId = itemTypeData.id

          if (!SPRITES[itemId]) {
            itemId = 'default'
          }

          const itemType = new ItemType(itemId, {
            isGround: itemTypeData.isGround,
            isWalkable: itemTypeData.isWalkable,
            actionId: itemTypeData.actionId,
            facing: itemTypeData.facing
          })
          const item = new Item(itemData.id, itemType)

          tile.addItem(item)
        }

        this.map.setTile(j, i, tile)
      }
    }

    this.map.render(this.entitiesLayer, 0, 0)

    this.cursor = new Cursor(TILE_SIZE, TILE_SIZE, this.map)
    this.uiLayer.addChild(this.cursor)

    this.setupMapBuilder()
  }

  private createPlayer(id: string, spritesheet: Spritesheet) {
    const player = new Player(id, spritesheet)

    const animator = this.createAnimator(player as AnimatedSprite, spritesheet)

    player.init(animator)
    player.zIndex = 1
    player.isPlayer = true

    return player
  }

  private createAnimator(player: AnimatedSprite, spritesheet: Spritesheet) {
    return new Animator(player, [
      new Animation('idle_north', spritesheet.animations.idle_north, 0.025),
      new Animation('idle_north', spritesheet.animations.idle_north, 0.025),
      new Animation('idle_south', spritesheet.animations.idle_south, 0.025),
      new Animation('idle_east', spritesheet.animations.idle_east, 0.025),
      new Animation('idle_west', spritesheet.animations.idle_west, 0.025),
      new Animation('walk_north', spritesheet.animations.walk_north, 0.2),
      new Animation('walk_south', spritesheet.animations.walk_south, 0.2),
      new Animation('walk_east', spritesheet.animations.walk_east, 0.2),
      new Animation('walk_west', spritesheet.animations.walk_west, 0.2),
      new Animation('sit_west', spritesheet.animations.sit_west, 0.025),
      new Animation('sit_east', spritesheet.animations.sit_east, 0.025),
      new Animation('drink_south', spritesheet.animations.drink_south, 0.025)
    ])
  }

  private handleSession(session: any) {
    const { sessionId, playerData } = session

    this.setupScene()

    localStorage.setItem('sessionId', sessionId)

    this.player = this.createPlayer(
      playerData.id,
      this.spritesheets.get(playerData.skin || DEFAULT_SKIN)
    )
    this.player.onStart()
    this.player.position.set(playerData.position.x, playerData.position.y)
    this.players[playerData.id] = this.player

    this.updatePlayerEquipment(this.player, playerData)

    this.entitiesLayer.addChild(this.player)
    this.addEntity(this.player)
  }

  private handlePlayerConnected(playerData: any) {
    console.log('Player connected:', playerData.id)

    if (this.player.id === playerData.id) {
      return
    }

    if (this.players[playerData.id]) {
      this.players[playerData.id].updateData(playerData)
      return
    }

    this.addPlayer(playerData)
  }

  private handleGameState(gameState: any) {
    console.log('Game state received:', gameState)

    this.setupMap(gameState.map)

    gameState.players.forEach((playerData) => {
      if (this.players[playerData.id]) {
        this.players[playerData.id].updateData(playerData)
      } else {
        this.addPlayer(playerData)
      }
    })
  }

  private addPlayer(playerData: any) {
    const player = this.createPlayer(
      playerData.id,
      this.spritesheets.get(playerData.skin || DEFAULT_SKIN)
    )
    player.onStart()
    player.updateData(playerData)
    this.updatePlayerEquipment(player, playerData)

    this.players[playerData.id] = player
    this.entitiesLayer.addChild(player)
    this.addEntity(player)
  }

  private onMouseMove(e) {
    const { x, y } = this.camera.transformToViewport(e.data.global.x, e.data.global.y)

    this.cursor.moveTo(x, y)
    this.spriteCursor.moveTo(x, y)
  }

  private onClick(e) {
    const { x, y } = this.camera.transformToViewport(e.data.global.x, e.data.global.y)

    const tileX = Math.floor(x / TILE_SIZE)
    const tileY = Math.floor(y / TILE_SIZE)

    if (!this.map.contains(tileX, tileY)) {
      return
    }

    const tile = this.map.getTile(tileX, tileY)

    if (this.isPlacingItem) {
      this.handlePlaceItem(tileX, tileY)
    } else if (tile.isEmpty() || tile.isWalkable()) {
      this.client.moveTo(x, y)
    } else if (!tile.isEmpty()) {
      this.client.use(x, y)
    }
  }

  private handlePlaceItem(x: number, y: number) {
    if (!this.spriteCursor.getSpriteId()) {
      return
    }

    if (!this.ctrlPressed) {
      this.client.placeItem(x * TILE_SIZE, y * TILE_SIZE, this.spriteCursor.getSpriteId())
    } else {
      this.client.removeItem(x * TILE_SIZE, y * TILE_SIZE)
    }
  }

  private handlePlayerChange(playerData: any) {
    if (this.players[playerData.id]) {
      const player = this.players[playerData.id]

      player.updateData(playerData)

      const skin = playerData.skin || DEFAULT_SKIN
      const spritesheet = this.spritesheets.get(skin)

      const animator = this.createAnimator(player as AnimatedSprite, spritesheet)

      player.setAnimator(animator)

      this.updatePlayerEquipment(player, playerData)
    }
  }

  private updatePlayerEquipment(player: Player, playerData: any) {
    this.updatePlayerHelmet(player, playerData)
  }

  private updatePlayerHelmet(player: Player, playerData: any) {
    console.log('Player helmet:', playerData.helmetSlot)

    if (!playerData.helmetSlot && !player.getHelmet()) {
      return
    }

    if (!playerData.helmetSlot) {
      player.unequip(player.getHelmet())

      return
    }

    const helmetSpritesheet = this.equipmentSpritesheets.get(playerData.helmetSlot)
    console.log('Equipped helmet:', playerData.helmetSlot)

    if (!helmetSpritesheet) {
      return
    }

    const helmet = new Equipment(playerData.helmetSlot, EquipmentType.Helmet, helmetSpritesheet)
    const animator = this.createAnimator(helmet as AnimatedSprite, helmetSpritesheet)
    helmet.init(animator)

    player.equip(helmet)
  }

  private handlePlayerDisconnected(playerData: any) {
    console.log('Player disconnected:', playerData.id)

    const player = this.players[playerData.id]

    player.clear()
    player.destroy()

    delete this.players[playerData.id]
  }

  private handleSendMessage({ detail: { message } }) {
    this.client.sendMessage(message.substring(0, 100))
  }

  private handleSelectItem({ detail: { id } }) {
    this.isPlacingItem = true
    this.spriteCursor.setSprite(id)
    this.cursor.hide()
  }

  private handleClearSelection() {
    this.isPlacingItem = false
    this.spriteCursor.clear()
    this.cursor.show()
  }

  private handleConfig({ detail: { name, skinName } }) {
    this.client.changeName(name.substring(0, 32))
    this.client.changeSkin(skinName)
  }

  private handleNotePress({ detail: { note } }) {
    this.client.playNote(note)
  }

  private handleNoteRelease({ detail: { note } }) {
    this.client.releaseNote(note)
  }

  private handleKeyDown(e) {
    this.ctrlPressed = e.ctrlKey
  }

  private handleKeyUp(e) {
    this.ctrlPressed = e.ctrlKey
  }

  private handlePlayerMessage({ playerId, message }) {
    const player = this.players[playerId]

    if (!player) {
      return
    }

    const chatMessage = player.say(message)

    this.addEntity(chatMessage)
    this.uiLayer.addChild(chatMessage)

    this.chat.addMessage(player.name, message)
  }

  private handlePlayerMove({ playerId, x, y, direction }) {
    const player = this.players[playerId]

    if (!player) {
      return
    }

    player.moveTo(x, y, direction)
  }

  private handleNotePlayed({ playerId, note }) {
    const player = this.players[playerId]

    if (!player) {
      return
    }

    if (player.id !== this.player.id) {
      window.dispatchEvent(new CustomEvent('ui:note_played', { detail: { note } }))
    }
  }

  private handleNoteReleased({ playerId, note }) {
    const player = this.players[playerId]

    if (!player) {
      return
    }

    if (player.id !== this.player.id) {
      window.dispatchEvent(new CustomEvent('ui:note_released', { detail: { note } }))
    }
  }

  private handleComputerOpen() {
    window.dispatchEvent(new CustomEvent('ui:show_os'))
  }

  private handleItemAdded({ x, y, item: { id, itemType } }) {
    const tile = this.map.getTile(x, y)
    const item = new Item(
      id,
      new ItemType(itemType.id, {
        isGround: itemType.isGround,
        isWalkable: itemType.isWalkable,
        actionId: itemType.actionId,
        facing: itemType.facing
      })
    )

    tile.addItem(item)
    item.render(this.entitiesLayer, x * TILE_SIZE, y * TILE_SIZE)
  }

  private handleItemRemoved({ id, x, y }) {
    const tile = this.map.getTile(x, y)

    tile.removeItem(id)
  }

  addEntity(entity: any) {
    this.entities.push(entity)

    entity.on('destroy', () => {
      this.entities.splice(this.entities.indexOf(entity), 1)
    })
  }

  reorderEntitiesLayer() {
    const nonGroundChildren = this.entitiesLayer.children.filter((child) => child.zIndex !== 0)

    nonGroundChildren.sort((a, b) => {
      const diff =
        a.y - a.height * a.anchor.y - a.pivot.y - (b.y - b.height * b.anchor.y - b.pivot.y)

      if (diff == 0) {
        if (a.isPlayer && !b.isPlayer) {
          return 1
        }

        if (!a.isPlayer && b.isPlayer) {
          return -1
        }

        return diff
      }

      return diff
    })

    let zIndex = 1

    for (const child of nonGroundChildren) {
      child.zIndex = zIndex++
    }
  }
}

export { Playground }
