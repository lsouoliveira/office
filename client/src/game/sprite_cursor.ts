import * as PIXI from 'pixi.js'
import { SPRITES } from './data/sprites'
import { TILE_SIZE } from './map/tile'
import { GameMap } from './map/game_map'

class SpriteCursor extends PIXI.Sprite {
  private sprite?: PIXI.Sprite
  private map: GameMap
  private spriteId?: string
  private spriteData: any

  constructor(map: GameMap) {
    super()

    this.map = map

    this.visible = false
  }

  update(dt: number) {}

  setSprite(id: string) {
    let spriteData

    if (id in SPRITES) {
      spriteData = SPRITES[id]
    } else {
      spriteData = SPRITES['default']
    }

    this.spriteData = spriteData
    this.spriteId = id
    this.visible = true

    const tilesetTexture = PIXI.Assets.get(spriteData.tileset)
    const pivot = spriteData.pivot || { x: 0, y: 0 }

    const tileId = spriteData.states[0]
    const tilesWidth = tilesetTexture.width / TILE_SIZE

    const tilesetX = tileId % tilesWidth
    const tilesetY = Math.floor(tileId / tilesWidth)

    const textureRect = new PIXI.Rectangle(
      tilesetX * TILE_SIZE,
      tilesetY * TILE_SIZE,
      spriteData.width * TILE_SIZE,
      spriteData.height * TILE_SIZE
    )
    const texture = new PIXI.Texture({ source: tilesetTexture.source, frame: textureRect })

    this.texture = texture
    this.anchor.set(pivot.x / spriteData.width, pivot.y / spriteData.height)
  }

  getSpriteId(): string | undefined {
    return this.spriteId
  }

  clear() {
    this.visible = false
  }

  moveTo(x: number, y: number) {
    if (!this.visible) {
      return
    }

    const tileX = Math.floor(x / TILE_SIZE)
    const tileY = Math.floor(y / TILE_SIZE)

    this.visible = true
    this.position.set(tileX * TILE_SIZE, tileY * TILE_SIZE - this.spriteData.y * TILE_SIZE)
  }
}

export { SpriteCursor }
