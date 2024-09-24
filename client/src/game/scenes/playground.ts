import { Assets, Sprite, Spritesheet, AnimatedSprite } from 'pixi.js'
import { Scene } from './scene'
import { MapLoader } from './../map/map_loader'
import { Camera } from './../camera'
import { Cursor } from './../cursor'
import { Client } from './../client'
import { Animator } from './../animation/animator'
import { Animation } from './../animation/animation'
import { Player, Direction } from './../characters/player'
import { Level } from './../map/map'

const TILE_SIZE = 16

class Playground extends Scene {
  private camera: Camera
  private player: Player
  private players: Map<string, Player> = new Map()
  private playgroundMap: Level
  private playerCursor: Cursor
  private client: Client
  private playerSpritesheet: Spritesheet
  private entities: any[] = []

  async onStart() {
    this.loadMap()

    this.playerSpritesheet = new Spritesheet(
      Assets.get('Bob_16x16.png'),
      Assets.get('default_spritesheet.json').data
    )

    await this.playerSpritesheet.parse()

    this.playerCursor = new Cursor(TILE_SIZE, TILE_SIZE, 0x00ff00, this.playgroundMap)

    this.camera = new Camera(this)
    this.camera.scale = Math.min(
      window.innerWidth / (TILE_SIZE * 32),
      window.innerHeight / (TILE_SIZE * 18)
    )

    this.addChild(this.playgroundMap)
    this.addChild(this.playerCursor)

    this.app.stage.on('pointermove', this.onMouseMove.bind(this))
    this.app.stage.on('click', this.onClick.bind(this))

    window.addEventListener('ui:send_message', this.handleSendMessage.bind(this))

    this.connectToServer()
  }

  update() {
    if (this.player) {
      this.camera.centerAt(
        this.player.position.x + this.player.width / 2,
        this.player.position.y + this.player.height / 2
      )
    }

    this.camera.update()
    this.playerCursor.update()

    for (const entity of this.entities) {
      entity.update(this.app.ticker.deltaMS)
    }
  }

  connectToServer() {
    const credentials = {
      username: 'test',
      sessionId: localStorage.getItem('sessionId')
    }

    this.client = new Client('ws://localhost:3000', credentials)
    this.client.socket.on('connect', () => {
      this.client.socket.on('session', this.handleSession.bind(this))
      this.client.socket.on('player:connected', this.handlePlayerConnected.bind(this))
      this.client.socket.on('player:disconnected', this.handlePlayerDisconnected.bind(this))
      this.client.socket.on('player:change', this.handlePlayerChange.bind(this))
      this.client.socket.on('player:message', this.handlePlayerMessage.bind(this))
      this.client.socket.on('gameState', this.handleGameState.bind(this))
    })
  }

  private loadMap() {
    const playgroundMapData = Assets.get('playground.json')
    this.playgroundMap = MapLoader.fromObject(playgroundMapData)
  }

  private createPlayer(id: string, spritesheet: Spritesheet) {
    const player = new Player(id, spritesheet)

    const animator = new Animator(player, [
      new Animation('idle_north', spritesheet.animations.idle_north, 0.025),
      new Animation('idle_south', spritesheet.animations.idle_south, 0.025),
      new Animation('idle_east', spritesheet.animations.idle_east, 0.025),
      new Animation('idle_west', spritesheet.animations.idle_west, 0.025),
      new Animation('walk_north', spritesheet.animations.walk_north, 0.2),
      new Animation('walk_south', spritesheet.animations.walk_south, 0.2),
      new Animation('walk_east', spritesheet.animations.walk_east, 0.2),
      new Animation('walk_west', spritesheet.animations.walk_west, 0.2)
    ])

    player.init(animator)

    return player
  }

  private handleSession(session: any) {
    const { sessionId, playerData } = session

    console.log('Session established:', sessionId)

    localStorage.setItem('sessionId', sessionId)

    this.player = this.createPlayer(playerData.id, this.playerSpritesheet)
    this.player.onStart()
    this.player.position.set(playerData.position.x, playerData.position.y)
    this.players[playerData.id] = this.player

    this.addChild(this.player)
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

    gameState.players.forEach((playerData) => {
      if (this.players[playerData.id]) {
        this.players[playerData.id].updateData(playerData)
      } else {
        this.addPlayer(playerData)
      }
    })
  }

  private addPlayer(playerData: any) {
    const player = this.createPlayer(playerData.id, this.playerSpritesheet)
    player.onStart()
    player.updateData(playerData)

    this.players[playerData.id] = player
    this.addChild(player)
  }

  private onMouseMove(e) {
    const { x, y } = this.camera.transformToViewport(e.data.global.x, e.data.global.y)

    this.playerCursor.moveTo(x, y)
  }

  private onClick(e) {
    const { x, y } = this.camera.transformToViewport(e.data.global.x, e.data.global.y)

    const tileX = Math.floor(x / TILE_SIZE)
    const tileY = Math.floor(y / TILE_SIZE)

    if (
      this.playgroundMap.contains(tileX, tileY) &&
      !this.playgroundMap.checkCollision(tileX, tileY)
    ) {
      this.client.moveTo(x, y)
    }
  }

  private handlePlayerChange(playerData: any) {
    if (this.players[playerData.id]) {
      this.players[playerData.id].updateData(playerData)
    }
  }

  private handlePlayerDisconnected(playerData: any) {
    console.log('Player disconnected:', playerData.id)

    this.removeChild(this.players[playerData.id])
    delete this.players[playerData.id]
  }

  private handleSendMessage({ detail: { message } }) {
    this.client.sendMessage(message)
  }

  private handlePlayerMessage({ playerId, message }) {
    const player = this.players[playerId]

    if (!player) {
      return
    }

    const chatMessage = player.say(message)

    this.addEntity(chatMessage)
  }

  addEntity(entity: any) {
    this.entities.push(entity)
    this.addChild(entity)

    entity.on('destroy', () => {
      this.entities.splice(this.entities.indexOf(entity), 1)
    })
  }
}

export { Playground }
