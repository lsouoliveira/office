import * as PIXI from 'pixi.js'
import { Assets, Sprite, Spritesheet, AnimatedSprite } from 'pixi.js'
import { Scene } from './scene'
import { Camera } from './../camera'
import { Client } from './../client'
import { type Animator, BaseAnimator, ComposedAnimator } from './../animation/animator'
import { Animation } from './../animation/animation'
import { Player, Direction } from './../characters/player'
import { GameMap } from './../map/game_map'
import { Tile } from './../map/tile'
import { ItemType } from './../items/item_type'
import { Item } from './../items/item'
import spritesData from './../data/sprites.json'
import { Cursor } from './../cursor'
import { SpriteCursor } from './../sprite_cursor'
import { Stats } from 'pixi-stats'
import { Chat } from './../entities/chat'
import { Emote } from './../entities/emote'
import { Equipment, EquipmentType } from './../characters/player'
import { SpritesheetSplitter, ComposedSpritesheet } from './../animation/spritesheet'
import { MoneyDisplay } from './../entities/money_display'
import { Announcement } from './../entities/announcement'
import { Inspect } from './../entities/inspect'
import { Projectile, ProjectileType } from './../entities/projectile'
import { Explosion, ExplosionType } from './../entities/explosion'
import { extractSpriteTextures } from '../utils'
import { TILE_SIZE } from './../map/tile'
import { Jukebox } from '../jukebox/jukebox'
import { Vehicle } from '../vehicle'

const DEFAULT_SKIN = 'Bob'

const SKINS = [
  {
    name: 'Bob',
    sprite: 'Bob_48x48.png'
  },
  {
    name: 'Alex',
    sprite: 'Alex_48x48.png'
  },
  {
    name: 'Amelia',
    sprite: 'Amelia_48x48.png'
  },
  {
    name: 'Adam',
    sprite: 'Adam_48x48.png'
  },
  {
    name: 'Conference Woman',
    sprite: 'Conference_woman_48x48.png'
  },
  {
    name: 'Edward',
    sprite: 'Edward_48x48.png'
  },
  {
    name: 'Molly',
    sprite: 'Molly_48x48.png'
  },
  {
    name: 'Pier',
    sprite: 'Pier_48x48.png'
  },
  {
    name: 'Prisoner 1',
    sprite: 'Prisoner_1_48x48.png'
  },
  {
    name: 'Prisoner 2',
    sprite: 'Prisoner_2_48x48.png'
  },
  {
    name: 'Rob',
    sprite: 'Rob_48x48.png'
  },
  {
    name: 'Samuel',
    sprite: 'Samuel_48x48.png'
  },
  {
    name: 'Santa Claus',
    sprite: 'Santa_Claus_48x48.png'
  }
]

const EQUIPMENTS = [
  {
    id: 'bataclava_01',
    type: EquipmentType.Helmet,
    sprite: 'bataclava_01.png'
  },
  {
    id: 'beanie_01',
    type: EquipmentType.Helmet,
    sprite: 'beanie_01.png'
  },
  {
    id: 'bee_01',
    type: EquipmentType.Helmet,
    sprite: 'bee_01.png'
  },
  {
    id: 'bolt_01',
    type: EquipmentType.Helmet,
    sprite: 'bolt_01.png'
  },
  {
    id: 'chef_01',
    type: EquipmentType.Helmet,
    sprite: 'chef_01.png'
  },
  {
    id: 'detective_hat_01',
    type: EquipmentType.Helmet,
    sprite: 'detective_hat_01.png'
  },
  {
    id: 'dino_snapback_01',
    type: EquipmentType.Helmet,
    sprite: 'dino_snapback_01.png'
  },
  {
    id: 'snapback_mclaren',
    type: EquipmentType.Helmet,
    sprite: 'snapback_mclaren.png'
  },
  {
    id: 'snapback_nacional',
    type: EquipmentType.Helmet,
    sprite: 'snapback_nacional.png'
  },
  {
    id: 'helmet',
    type: EquipmentType.Helmet,
    sprite: 'helmet.png'
  },
  {
    id: 'santa_hat',
    type: EquipmentType.Helmet,
    sprite: 'santa_hat.png'
  },
  {
    id: 'glasses_01',
    type: EquipmentType.Glasses,
    sprite: 'glasses_01.png'
  },
  {
    id: 'ladybug_01',
    type: EquipmentType.Helmet,
    sprite: 'ladybug_01.png'
  },
  {
    id: 'medical_mask_01',
    type: EquipmentType.FaceMask,
    sprite: 'medical_mask_01.png'
  },
  {
    id: 'monocle_01',
    type: EquipmentType.Glasses,
    sprite: 'monocle_01.png'
  },
  {
    id: 'mustache_01',
    type: EquipmentType.FaceMask,
    sprite: 'mustache_01.png'
  },
  {
    id: 'beard_01',
    type: EquipmentType.FaceMask,
    sprite: 'beard_01.png'
  },
  {
    id: 'party_cone_01',
    type: EquipmentType.Helmet,
    sprite: 'party_cone_01.png'
  },
  {
    id: 'party_cone_04',
    type: EquipmentType.Helmet,
    sprite: 'party_cone_04.png'
  },
  {
    id: 'policeman_hat_01',
    type: EquipmentType.Helmet,
    sprite: 'policeman_hat_01.png'
  },
  {
    id: 'snapback_01',
    type: EquipmentType.Helmet,
    sprite: 'snapback_01.png'
  },
  {
    id: 'snapback_02',
    type: EquipmentType.Helmet,
    sprite: 'snapback_02.png'
  },
  {
    id: 'snapback_03',
    type: EquipmentType.Helmet,
    sprite: 'snapback_03.png'
  },
  {
    id: 'snapback_04',
    type: EquipmentType.Helmet,
    sprite: 'snapback_04.png'
  },
  {
    id: 'snapback_05',
    type: EquipmentType.Helmet,
    sprite: 'snapback_05.png'
  },
  {
    id: 'zombie_brain_01',
    type: EquipmentType.Helmet,
    sprite: 'zombie_brain_01.png'
  }
]

const VEHICLES = [
  {
    id: 'classic_red_car',
    sprite: 'Car_classic_red_complete_48x48.png'
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
  private uiLayer: PIXI.Container = new PIXI.Container()
  private cursor: Cursor
  private spriteCursor: SpriteCursor
  private isPlacingItem: boolean = false
  private ctrlPressed: boolean = false
  private altPressed: boolean = false
  private shiftPressed: boolean = false
  private chat: Chat
  private playerSkins: Map<string, ComposedSpritesheet> = new Map()
  private equipmentSpritesheets: Map<string, Spritesheet> = new Map()
  private vehicleSpritesheets: Map<string, Spritesheet> = new Map()
  private layers: PIXI.Container[] = []
  private isConnected: boolean = false
  private isConnectingText: PIXI.Text
  private isLoading: boolean = true
  private emoteSpritesheet: PIXI.Texture
  private moneyDisplay: MoneyDisplay
  private announcement: Announcement
  private inspect: Inspect
  private projectiles: Map<string, Projectile> = new Map()
  private jukebox: Jukebox
  private jukeboxTimeout: NodeJS.Timeout

  async onStart() {
    // const stats = new Stats(this.app.renderer)

    this.isConnectingText = new PIXI.Text('Conectando...', {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: 0xffff00
    })
    this.isConnectingText.position.set(window.innerWidth / 2, window.innerHeight / 2)
    this.isConnectingText.anchor.set(0.5)
    this.addChild(this.isConnectingText)

    this.announcement = new Announcement()
    this.announcement.position.set(window.innerWidth / 2, 8)
    this.app.stage.addChild(this.announcement)
    this.addEntity(this.announcement)

    this.inspect = new Inspect()
    this.inspect.position.set(window.innerWidth / 2, window.innerHeight / 2)
    this.app.stage.addChild(this.inspect)
    this.addEntity(this.inspect)

    for (let i = 0; i < SKINS.length; i++) {
      const { name, sprite } = SKINS[i]

      const spritesheet = new Spritesheet(
        Assets.get(sprite),
        Assets.get('default_spritesheet_48x48.json').data
      )
      await spritesheet.parse()

      const splitter = new SpritesheetSplitter(spritesheet)
      const composedSpritesheet = splitter.split(TILE_SIZE, 2 * TILE_SIZE, TILE_SIZE)

      this.playerSkins.set(name, composedSpritesheet)
    }

    EQUIPMENTS.forEach(({ id, type, sprite }) => {
      this.equipmentSpritesheets.set(
        id,
        new Spritesheet(Assets.get(sprite), Assets.get('default_spritesheet_48x48.json').data)
      )
    })

    VEHICLES.forEach(({ id, sprite }) => {
      this.vehicleSpritesheets.set(
        id,
        new Spritesheet(Assets.get(sprite), Assets.get('car_spritesheet_48x48.json').data)
      )
    })

    for (const spritesheet of this.equipmentSpritesheets.values()) {
      await spritesheet.parse()
    }

    for (const spritesheet of this.vehicleSpritesheets.values()) {
      await spritesheet.parse()
    }

    this.emoteSpritesheet = Assets.get('ui_48x48.png')

    this.camera = new Camera(this)
    this.camera.scale = Math.min(
      window.innerWidth / (TILE_SIZE * 32),
      window.innerHeight / (TILE_SIZE * 18)
    ).toFixed(2)

    for (let i = 0; i < 10; i++) {
      const layer = new PIXI.Container()

      layer.sortableChildren = true
      layer.zIndex = i

      this.layers.push(layer)
      this.addChild(layer)
    }

    this.jukebox = new Jukebox()

    this.jukeboxTimeout = setInterval(() => {
      this.jukebox.update(1.0 / 60.0)
    }, 1000 / 60)

    this.connectToServer()
  }

  update(dt: any) {
    if (this.isLoading) {
      return
    }

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
  }

  fixedUpdate(dt: number) {
    for (const entity of this.entities) {
      if (entity.fixedUpdateEntity) {
        entity.fixedUpdateEntity(dt)
      }
    }
  }

  setupMapBuilder() {
    this.spriteCursor = new SpriteCursor(this.map)

    this.uiLayer.addChild(this.spriteCursor)
  }

  connectToServer() {
    console.log('connecting to server')

    const credentials = {
      sessionId: localStorage.getItem('sessionId'),
      token: localStorage.getItem('token')
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
      this.client.socket.on('player:emotePlayed', this.handlePlayEmote.bind(this))
      this.client.socket.on('player:memory_charm', this.handleMemoryCharm.bind(this))
      this.client.socket.on('computer:open', this.handleComputerOpen.bind(this))
      this.client.socket.on('jukebox:open', this.handleJukeboxOpen.bind(this))
      this.client.socket.on('jukebox:nextTrack', this.handleJukeboxNextTrack.bind(this))
      this.client.socket.on('world:announcement', this.handleWorldAnnouncement.bind(this))
      this.client.socket.on('ping_pong:open', this.handlePingPongOpen.bind(this))
      this.client.socket.on('item:added', this.handleItemAdded.bind(this))
      this.client.socket.on('item:removed', this.handleItemRemoved.bind(this))
      this.client.socket.on('item:replaced', this.handleItemReplaced.bind(this))
      this.client.socket.on('item:inspect', this.handleItemInspect.bind(this))
      this.client.socket.on('projectile:added', this.handleProjectileAdded.bind(this))
      this.client.socket.on('projectile:removed', this.handleProjectileRemoved.bind(this))
      this.client.socket.on('projectile:updated', this.handleProjectileUpdated.bind(this))
      this.client.socket.on('explosion:added', this.handleExplosionAdded.bind(this))
      this.client.socket.on('gameState', this.handleGameState.bind(this))
    })

    window.gameClient = this.client
  }

  setupScene() {
    this.uiLayer.zIndex = 999
    this.addChild(this.uiLayer)

    this.app.stage.on('pointermove', this.onMouseMove.bind(this))
    this.app.stage.on('click', this.onClick.bind(this))

    window.addEventListener('ui:send_message', this.handleSendMessage.bind(this))
    window.addEventListener('ui:select_item', this.handleSelectItem.bind(this))
    window.addEventListener('ui:clear_selection', this.handleClearSelection.bind(this))
    window.addEventListener('ui:config', this.handleConfig.bind(this))
    window.addEventListener('ui:note_press', this.handleNotePress.bind(this))
    window.addEventListener('ui:note_release', this.handleNoteRelease.bind(this))
    window.addEventListener('ui:emote', this.handleEmote.bind(this))
    window.addEventListener('keydown', this.handleKeyDown.bind(this))
    window.addEventListener('keyup', this.handleKeyUp.bind(this))

    this.chat = new Chat({ maxMessages: 15 })
    this.chat.position.set(8, window.innerHeight - 24)

    this.app.stage.addChild(this.chat)
    this.addEntity(this.chat)
  }

  async onDestroy() {
    console.log('destroying playground')
    this.app.stage.off('pointermove', this.onMouseMove.bind(this))
    this.app.stage.off('click', this.onClick.bind(this))

    window.removeEventListener('ui:send_message', this.handleSendMessage.bind(this))
    window.removeEventListener('ui:select_item', this.handleSelectItem.bind(this))
    window.removeEventListener('ui:clear_selection', this.handleClearSelection.bind(this))
    window.removeEventListener('ui:config', this.handleConfig.bind(this))
    window.removeEventListener('ui:note_press', this.handleNotePress.bind(this))
    window.removeEventListener('ui:note_release', this.handleNoteRelease.bind(this))
    window.removeEventListener('ui:emote', this.handleEmote.bind(this))
    window.removeEventListener('keydown', this.handleKeyDown.bind(this))
    window.removeEventListener('keyup', this.handleKeyUp.bind(this))

    this.client.socket.disconnect()

    clearInterval(this.jukeboxTimeout)
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

          if (!spritesData[itemId]) {
            itemId = 'default'
          }

          const itemType = new ItemType(itemId, {
            isGround: itemTypeData.isGround,
            isWalkable: itemTypeData.isWalkable,
            isWall: itemTypeData.isWall,
            actionId: itemTypeData.actionId,
            facing: itemTypeData.facing,
            isDoor: itemTypeData.isDoor
          })
          const item = new Item(itemData.id, itemType)

          tile.addItem(item)
        }

        this.map.setTile(j, i, tile)
      }
    }

    this.map.render(this.layers, 0, 0)

    this.cursor = new Cursor(TILE_SIZE, TILE_SIZE, this.map)
    this.uiLayer.addChild(this.cursor)

    this.setupMapBuilder()
  }

  private createPlayer(id: string, composedSpritesheet: ComposedSpritesheet) {
    const player = new Player(id, composedSpritesheet, this.layers)

    const topHalfAnimator = this.createAnimator(player.topHalfSprite, composedSpritesheet, 0, 0)
    const bottomHalfAnimator = this.createAnimator(
      player.bottomHalfSprite,
      composedSpritesheet,
      0,
      1
    )
    const animator = new ComposedAnimator([topHalfAnimator, bottomHalfAnimator])

    player.init(animator)
    player.zIndex = 1

    return player
  }

  private createAnimator(
    sprite: AnimatedSprite,
    composedSpritesheet: ComposedSpritesheet,
    x: number,
    y: number
  ) {
    return new BaseAnimator(sprite, [
      new Animation('idle_north', composedSpritesheet.getTextures('idle_north', x, y), 0.025),
      new Animation('idle_south', composedSpritesheet.getTextures('idle_south', x, y), 0.025),
      new Animation('idle_east', composedSpritesheet.getTextures('idle_east', x, y), 0.025),
      new Animation('idle_west', composedSpritesheet.getTextures('idle_west', x, y), 0.025),
      new Animation('walk_north', composedSpritesheet.getTextures('walk_north', x, y), 0.2),
      new Animation('walk_south', composedSpritesheet.getTextures('walk_south', x, y), 0.2),
      new Animation('walk_east', composedSpritesheet.getTextures('walk_east', x, y), 0.2),
      new Animation('walk_west', composedSpritesheet.getTextures('walk_west', x, y), 0.2),
      new Animation('sit_west', composedSpritesheet.getTextures('sit_west', x, y), 0.025),
      new Animation('sit_east', composedSpritesheet.getTextures('sit_east', x, y), 0.025),
      new Animation('drink_south', composedSpritesheet.getTextures('drink_south', x, y), 0.025),
      new Animation('eat_south', composedSpritesheet.getTextures('eat_south', x, y), 0.025)
    ])
  }

  private createBaseAnimator(player: AnimatedSprite, spritesheet: Spritesheet) {
    return new BaseAnimator(player, [
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
      new Animation('drink_south', spritesheet.animations.drink_south, 0.025),
      new Animation('eat_south', spritesheet.animations.drink_south, 0.025)
    ])
  }

  private handleSession(session: any) {
    const { sessionId, playerData } = session

    if (this.isConnected) {
      this.isConnected = false
      this.sceneManager.load('playground')
      return
    }

    localStorage.setItem('sessionId', sessionId)

    const skin = this.playerSkins.get(playerData.skin || DEFAULT_SKIN)

    if (!skin) {
      return
    }

    this.player = this.createPlayer(playerData.id, skin)
    this.player.onStart()
    this.player.position.set(playerData.position.x, playerData.position.y)
    this.players[playerData.id] = this.player

    this.updatePlayerEquipment(this.player, playerData)
    this.driveVehicle(this.player, playerData)

    this.moneyDisplay = new MoneyDisplay()
    this.moneyDisplay.position.set(8, 8)
    this.moneyDisplay.setAmount(playerData.money)
    this.app.stage.addChild(this.moneyDisplay)
    this.addEntity(this.moneyDisplay)

    this.isConnected = true
  }

  private handlePlayerConnected(playerData: any) {
    console.log('Player connected:', playerData.id)

    if (this.player?.id === playerData.id) {
      return
    }

    if (this.players[playerData.id]) {
      this.players[playerData.id].updateData(playerData)
      return
    }

    this.addPlayer(playerData)
  }

  private handleGameState(gameState: any) {
    if (!this.isConnected) {
      return
    }

    this.setupScene()
    this.setupMap(gameState.map)

    this.layers[2].addChild(this.player.topHalf)
    this.layers[1].addChild(this.player.bottomHalf)
    this.uiLayer.addChild(this.player.playerName)
    this.uiLayer.addChild(this.player.rightHandSlot)
    this.uiLayer.addChild(this.player.shieldEffect)

    this.addEntity(this.player)

    gameState.players.forEach((playerData) => {
      if (this.players[playerData.id]) {
        this.players[playerData.id].updateData(playerData)
      } else {
        this.addPlayer(playerData)
      }
    })

    this.isLoading = false
    this.isConnectingText.destroy()

    if (gameState.currentTrack) {
      this.jukebox.play(gameState.currentTrack)
    }
  }

  private addPlayer(playerData: any) {
    const skin = this.playerSkins.get(playerData.skin || DEFAULT_SKIN)

    if (!skin) {
      return
    }

    const player = this.createPlayer(playerData.id, skin)

    player.onStart()
    this.updatePlayerEquipment(player, playerData)
    this.driveVehicle(player, playerData)
    player.updateData(playerData)

    this.players[playerData.id] = player

    this.layers[2].addChild(player.topHalf)
    this.layers[1].addChild(player.bottomHalf)
    this.uiLayer.addChild(player.playerName)
    this.uiLayer.addChild(player.rightHandSlot)
    this.uiLayer.addChild(player.shieldEffect)
    this.layers[0].addChild(player)

    this.addEntity(player)
  }

  private onMouseMove(e) {
    const { x, y } = this.camera.transformToViewport(e.data.global.x, e.data.global.y)

    this.cursor.moveTo(x, y)
    this.spriteCursor.moveTo(x, y)

    if (this.spriteCursor.isActive() && this.altPressed) {
      this.handlePlaceItem(Math.floor(x / TILE_SIZE), Math.floor(y / TILE_SIZE))
    }
  }

  private onClick(e) {
    const { x, y } = this.camera.transformToViewport(e.data.global.x, e.data.global.y)

    const tileX = Math.floor(x / TILE_SIZE)
    const tileY = Math.floor(y / TILE_SIZE)

    if (!this.map.contains(tileX, tileY)) {
      return
    }

    const tile = this.map.getTile(tileX, tileY)

    if (this.shiftPressed) {
      const topItem = tile.getTopItem()

      if (!topItem) {
        return
      }

      const itemTypeId = topItem.getItemTypeId()

      this.handleSelectItem({ detail: { id: itemTypeId } })

      document.title = `id: ${itemTypeId}`
    }

    if (this.isPlacingItem) {
      this.handlePlaceItem(tileX, tileY)
    } else if ((tile.isEmpty() || tile.isWalkable()) && !e.ctrlKey) {
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

      const skin = playerData.skin || DEFAULT_SKIN
      const spritesheet = this.playerSkins.get(skin)

      if (!spritesheet) {
        return
      }

      this.updatePlayerEquipment(player, playerData)
      this.driveVehicle(player, playerData)

      const topHalfAnimator = this.createAnimator(player.topHalfSprite, spritesheet, 0, 0)
      const bottomHalfAnimator = this.createAnimator(player.bottomHalfSprite, spritesheet, 0, 1)
      const animator = new ComposedAnimator([topHalfAnimator, bottomHalfAnimator])

      player.setAnimator(animator)
      player.updateData(playerData)

      if (playerData.id === this.player.id) {
        const diff = playerData.money - this.moneyDisplay.getAmount()
        this.moneyDisplay.changeAmount(diff)
      }
    }
  }

  private updatePlayerEquipment(player: Player, playerData: any) {
    this.updatePlayerHelmet(player, playerData)
    this.updatePlayerGlasses(player, playerData)
    this.updatePlayerFaceMask(player, playerData)
    this.updatePlayerRightHand(player, playerData)
  }

  private driveVehicle(player: Player, playerData: any) {
    if (!playerData.vehicle) {
      player.exitVehicle()

      return
    }

    const vehicle = this.createVehicle(playerData.vehicle.itemType.equipment.id)

    if (!vehicle) {
      return
    }

    player.drive(vehicle)
  }

  private updatePlayerHelmet(player: Player, playerData: any) {
    const playerHelmet = player.getHelmet()

    if (!playerData.helmetSlot && !playerHelmet) {
      return
    }

    if (!playerData.helmetSlot && playerHelmet) {
      player.unequip(playerHelmet)

      return
    }

    const helmetSpritesheet = this.equipmentSpritesheets.get(
      playerData.helmetSlot.itemType.equipment.id
    )

    if (!helmetSpritesheet) {
      return
    }

    const helmet = new Equipment(
      playerData.helmetSlot.itemType.equipment.id,
      EquipmentType.Helmet,
      playerData.helmetSlot.itemType.equipment.hideHair,
      helmetSpritesheet
    )
    const animator = this.createBaseAnimator(helmet as AnimatedSprite, helmetSpritesheet)
    helmet.init(animator)

    player.equip(helmet)
  }

  private updatePlayerGlasses(player: Player, playerData: any) {
    const playerGlasses = player.getGlasses()

    if (!playerData.glassesSlot && !playerGlasses) {
      return
    }

    if (!playerData.glassesSlot && playerGlasses) {
      player.unequip(playerGlasses)

      return
    }

    const glassesSpritesheet = this.equipmentSpritesheets.get(
      playerData.glassesSlot.itemType.equipment.id
    )

    if (!glassesSpritesheet) {
      return
    }

    const glasses = new Equipment(
      playerData.glassesSlot.itemType.equipment.id,
      EquipmentType.Glasses,
      playerData.glassesSlot.itemType.equipment.hideHair,
      glassesSpritesheet
    )
    const animator = this.createBaseAnimator(glasses as AnimatedSprite, glassesSpritesheet)
    glasses.init(animator)

    player.equip(glasses)
  }

  private updatePlayerFaceMask(player: Player, playerData: any) {
    const playerFaceMask = player.getFaceMask()

    if (!playerData.faceMaskSlot && !playerFaceMask) {
      return
    }

    if (!playerData.faceMaskSlot && playerFaceMask) {
      player.unequip(playerFaceMask)

      return
    }

    const faceMaskSpritesheet = this.equipmentSpritesheets.get(
      playerData.faceMaskSlot.itemType.equipment.id
    )

    if (!faceMaskSpritesheet) {
      return
    }

    const faceMask = new Equipment(
      playerData.faceMaskSlot.itemType.equipment.id,
      EquipmentType.FaceMask,
      playerData.faceMaskSlot.itemType.equipment.hideHair,
      faceMaskSpritesheet
    )
    const animator = this.createBaseAnimator(faceMask as AnimatedSprite, faceMaskSpritesheet)
    faceMask.init(animator)

    player.equip(faceMask)
  }

  private updatePlayerRightHand(player: Player, playerData: any) {
    if (!playerData.rightHandSlot && !player.getRightHand()) {
      return
    }

    if (!playerData.rightHandSlot) {
      player.unequip(player.getRightHand())

      return
    }

    const rightHandWeaponSprite = extractSpriteTextures(playerData.rightHandSlot.itemType.id)
    const rightHandWeapon = new Equipment(
      playerData.rightHandSlot.itemType.equipment.id,
      EquipmentType.Wand,
      playerData.rightHandSlot.itemType.equipment.hideHair,
      undefined,
      rightHandWeaponSprite
    )
    rightHandWeapon.width = TILE_SIZE / 2
    rightHandWeapon.height = TILE_SIZE / 2
    rightHandWeapon.anchor.set(0.5, 0)

    player.equip(rightHandWeapon)
  }

  private handlePlayerDisconnected(playerData: any) {
    console.log('Player disconnected:', playerData.id)

    const player = this.players[playerData.id]

    player.clear()
    player.destroy()

    this.destroyEntity(player)

    delete this.players[playerData.id]
  }

  private handleSendMessage({ detail: { message } }) {
    const sanitazedMessage = message.substring(0, 400).trim()

    if (!sanitazedMessage) {
      return
    }

    this.client.sendMessage(sanitazedMessage)
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

  private handleEmote({ detail: { id } }) {
    this.client.playEmote(id)
  }

  private handlePlayEmote({ playerId, emoteId }: { playerId: string; emoteId: string }) {
    const player = this.players[playerId]

    if (!player) {
      return
    }

    if (!player.canEmote(emoteId)) {
      return
    }

    const emote = Emote.create(emoteId, this.emoteSpritesheet)

    if (!emote) {
      return
    }

    player.emote(emote)

    this.addEntity(emote)
    this.uiLayer.addChild(emote)
  }

  private handleMemoryCharm({ playerId }: { playerId: string }) {
    if (this.player?.id != playerId) {
      return
    }

    this.chat.clear()
  }

  private handleKeyDown(e) {
    this.ctrlPressed = e.ctrlKey
    this.altPressed = e.altKey
    this.shiftPressed = e.shiftKey
  }

  private handleKeyUp(e) {
    this.ctrlPressed = e.ctrlKey
    this.altPressed = e.altKey
    this.shiftPressed = e.shiftKey
  }

  private handlePlayerMessage({ playerId, message, color, compact }) {
    const player = this.players[playerId]

    if (!player) {
      return
    }

    const chatMessage = player.say(message, color || 'yellow', compact || false)

    this.addEntity(chatMessage)
    this.uiLayer.addChild(chatMessage)

    this.chat.addMessage(player.name, message)

    if (player.id !== this.player?.id) {
      window.dispatchEvent(new CustomEvent('ui:player_message', { detail: { message } }))
    }
  }

  private handlePlayerMove({ playerId, x, y, direction }) {
    const player = this.players[playerId]

    if (!player) {
      return
    }

    player.moveTo(x, y, direction)
  }

  private handleNotePlayed({ playerId, note, broadcast }) {
    const player = this.players[playerId]

    if (!player) {
      return
    }

    if (player.id !== this.player.id || broadcast) {
      if (note instanceof Array) {
        note.forEach((n) => {
          window.dispatchEvent(new CustomEvent('ui:note_played', { detail: { note: n } }))
        })
      } else {
        window.dispatchEvent(new CustomEvent('ui:note_played', { detail: { note } }))
      }
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

  private handleJukeboxOpen() {
    window.dispatchEvent(new CustomEvent('ui:show_jukebox'))
  }

  private handleJukeboxNextTrack(track: any) {
    this.jukebox.play(track)
  }

  private async handleWorldAnnouncement({ message, level }: { message: string; level: number }) {
    this.announcement.show(message, level)
  }

  private handlePingPongOpen() {
    window.dispatchEvent(new CustomEvent('ui:show_ping_pong'))
  }

  private handleItemAdded({ x, y, item: { id, itemType } }) {
    const tile = this.map.getTile(x, y)
    const item = new Item(
      id,
      new ItemType(itemType.id, {
        isGround: itemType.isGround,
        isWalkable: itemType.isWalkable,
        isWall: itemType.isWall,
        actionId: itemType.actionId,
        facing: itemType.facing,
        isDoor: itemType.isDoor
      })
    )

    tile.addItem(item)
    item.render(this.layers, x * TILE_SIZE, y * TILE_SIZE, tile.getItemHeight(item))
  }

  private handleItemRemoved({ id, x, y }) {
    const tile = this.map.getTile(x, y)

    tile.removeItem(id)
  }

  private handleItemReplaced({ tile: { x, y }, item, newItem }) {
    if (!this.map.contains(x, y)) {
      return
    }

    const tile = this.map.getTile(x, y)

    const itemType = new ItemType(newItem.itemType.id, {
      isGround: newItem.itemType.isGround,
      isWalkable: newItem.itemType.isWalkable,
      isWall: newItem.itemType.isWall,
      actionId: newItem.itemType.actionId,
      facing: newItem.itemType.facing,
      isDoor: newItem.itemType.isDoor
    })

    const itemToAdd = new Item(newItem.id, itemType)
    const oldItem = tile.getItem(item.id)

    if (!oldItem) {
      return
    }

    tile.replaceItem(item.id, itemToAdd)
    itemToAdd.render(this.layers, x * TILE_SIZE, y * TILE_SIZE, tile.getItemHeight(itemToAdd))
    oldItem.destroy()

    if (oldItem.isDoor()) {
      itemToAdd.play()
    }
  }

  private handleItemInspect({ description }: { description: string }) {
    this.inspect.show(description)
  }

  private async handleProjectileAdded({
    id,
    name,
    position,
    direction,
    speed,
    duration,
    timestamp
  }) {
    const delay = (Date.now() - timestamp) / 1000
    const updatedPosition = {
      x: position.x + direction.x * speed * delay,
      y: position.y + direction.y * speed * delay
    }
    const projectile = Projectile.createProjectile(
      id,
      name,
      updatedPosition.x,
      updatedPosition.y,
      direction,
      speed,
      duration
    )

    this.addEntity(projectile)
    this.uiLayer.addChild(projectile)
    this.projectiles.set(id, projectile)
  }

  private async handleProjectileRemoved({ id }) {
    const projectile = this.projectiles.get(id)

    if (!projectile) {
      return
    }

    projectile.destroy()
    this.projectiles.delete(id)
  }

  private async handleProjectileUpdated({
    id,
    name,
    position,
    direction,
    speed,
    duration,
    timestamp
  }) {
    const delay = (Date.now() - timestamp) / 1000
    const updatedPosition = {
      x: position.x + direction.x * speed * delay,
      y: position.y + direction.y * speed * delay
    }

    const projectile = this.projectiles.get(id)

    if (!projectile) {
      return
    }

    projectile.position.set(updatedPosition.x, updatedPosition.y)
    projectile.setDirection(direction)
  }

  addEntity(entity: any) {
    this.entities.push(entity)

    entity.on('destroy', () => {
      if (entity.parent) {
        entity.parent.removeChild(entity)
      }

      this.entities.splice(this.entities.indexOf(entity), 1)
    })
  }

  private async handleExplosionAdded({ position, type }) {
    const explosion = Explosion.createExplosion(
      Math.floor(Math.random() * 1000000).toString(),
      type,
      position.x,
      position.y
    )

    this.addEntity(explosion)
    this.uiLayer.addChild(explosion)
  }

  destroyEntity(entity: any) {
    this.entities.splice(this.entities.indexOf(entity), 1)
  }

  private createVehicle(vehicleId: string) {
    const vehicleSpritesheet = this.vehicleSpritesheets.get(vehicleId)

    if (!vehicleSpritesheet) {
      return
    }

    const vehicleSprite = new PIXI.AnimatedSprite(vehicleSpritesheet.animations.idle_east)
    vehicleSprite.animationSpeed = 0.1
    vehicleSprite.play()

    const vehicleAnimator = new BaseAnimator(vehicleSprite, [
      new Animation('idle_north', vehicleSpritesheet.animations.idle_north, 0.1),
      new Animation('idle_south', vehicleSpritesheet.animations.idle_south, 0.1),
      new Animation('idle_east', vehicleSpritesheet.animations.idle_east, 0.1),
      new Animation('idle_west', vehicleSpritesheet.animations.idle_west, 0.1)
    ])

    return new Vehicle(vehicleSprite, vehicleAnimator)
  }
}

export { Playground }
