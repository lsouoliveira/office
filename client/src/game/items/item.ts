import * as PIXI from 'pixi.js'
import { ItemType } from './item_type'
import spritesData from './../data/sprites.json'
import { TILE_SIZE } from './../map/tile'

class Item {
  private id: string
  private type: ItemType
  private sprite?: PIXI.Sprite

  constructor(id: string, type: ItemType) {
    this.id = id
    this.type = type
  }

  isGround(): boolean {
    return this.type.isGround()
  }

  isWalkable(): boolean {
    return this.type.isWalkable()
  }

  getId(): string {
    return this.id
  }

  render(stage: PIXI.Container, x: number, y: number): void {
    const spriteData = spritesData[this.type.getId()]

    if (!spriteData) {
      return
    }

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
    const spriteX = x
    const spriteY = y - spriteData.y * TILE_SIZE

    this.sprite = new PIXI.Sprite(texture)
    this.sprite.zIndex = this.getZIndex()
    this.sprite.position.set(spriteX, spriteY)
    this.sprite.anchor.set(pivot.x / spriteData.width, pivot.y / spriteData.height)

    stage.addChild(this.sprite)
  }

  private getZIndex(): number {
    return this.type.isGround() ? 0 : 1
  }

  destroy(): void {
    if (this.sprite) {
      this.sprite.destroy()
    }
  }
}

export { Item }
