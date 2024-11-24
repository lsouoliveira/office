import * as PIXI from 'pixi.js'
import spritesData from './data/sprites.json'
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
    this.width = TILE_SIZE
    this.height = TILE_SIZE

    this.visible = false
  }

  update(dt: number) {}

  setSprite(id: string) {
    let spriteData

    if (id in spritesData) {
      spriteData = spritesData[id]
    } else {
      spriteData = spritesData['default']
    }

    this.spriteData = spriteData
    this.spriteId = id
    this.visible = true

    const tilesetTexture = PIXI.Assets.get(spriteData.tileset)
    const pivot = spriteData.pivot || { x: 0, y: 0 }

    const tileId = spriteData.states[0]
    const tileSize = spriteData.tileSize || TILE_SIZE
    const tilesWidth = tilesetTexture.width / tileSize

    const tilesetX = tileId % tilesWidth
    const tilesetY = Math.floor(tileId / tilesWidth)

    const textureRect = new PIXI.Rectangle(
      tilesetX * tileSize,
      tilesetY * tileSize,
      spriteData.width * tileSize,
      spriteData.height * tileSize
    )
    const texture = new PIXI.Texture({ source: tilesetTexture.source, frame: textureRect })

    this.texture = texture
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
    this.position.set(tileX * TILE_SIZE, tileY * TILE_SIZE)
  }
}

export { SpriteCursor }
