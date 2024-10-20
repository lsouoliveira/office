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

    const textures = this.extractTextures(tilesetTexture.baseTexture, spriteData)
    const spriteX = x
    const spriteY = y - spriteData.y * TILE_SIZE

    if (textures.length > 1) {
      this.sprite = this.createAnimatedSprite(textures, spriteX, spriteY, pivot, spriteData)
    } else {
      this.sprite = this.createSprite(textures[0], spriteX, spriteY, pivot, spriteData)
    }

    stage.addChild(this.sprite)
  }

  private extractTextures(source: PIXI.BaseTexture, spriteData: any): PIXI.Texture[] {
    const textures: PIXI.Texture[] = []
    const tilesWidth = source.width / TILE_SIZE

    for (const state of spriteData.states) {
      const tilesetX = state % tilesWidth
      const tilesetY = Math.floor(state / tilesWidth)

      const textureRect = new PIXI.Rectangle(
        tilesetX * TILE_SIZE,
        tilesetY * TILE_SIZE,
        spriteData.width * TILE_SIZE,
        spriteData.height * TILE_SIZE
      )
      const texture = new PIXI.Texture({ source: source.source, frame: textureRect })
      textures.push(texture)
    }

    return textures
  }

  private getZIndex(): number {
    return this.type.isGround() ? 0 : 1
  }

  private createSprite(
    texture: PIXI.Texture,
    x: number,
    y: number,
    pivot: { x: number; y: number },
    spriteData: any
  ): PIXI.Sprite {
    const sprite = new PIXI.Sprite(texture)

    sprite.zIndex = this.getZIndex()
    sprite.position.set(x, y)
    sprite.anchor.set(pivot.x / spriteData.width, pivot.y / spriteData.height)

    return sprite
  }

  private createAnimatedSprite(
    textures: PIXI.Texture[],
    x: number,
    y: number,
    pivot: { x: number; y: number },
    spriteData: any
  ): PIXI.AnimatedSprite {
    const sprite = new PIXI.AnimatedSprite(textures)

    sprite.zIndex = this.getZIndex()
    sprite.position.set(x, y)
    sprite.anchor.set(pivot.x / spriteData.width, pivot.y / spriteData.height)
    sprite.animationSpeed = spriteData.animation_speed || 0.1
    sprite.play()

    return sprite
  }

  destroy(): void {
    if (this.sprite) {
      this.sprite.destroy()
    }
  }
}

export { Item }
