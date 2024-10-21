import * as PIXI from 'pixi.js'
import { ItemType } from './item_type'
import spritesData from './../data/sprites.json'
import { TILE_SIZE } from './../map/tile'

class Item {
  private id: string
  private type: ItemType
  private sprites: PIXI.Sprite[] = []

  constructor(id: string, type: ItemType) {
    this.id = id
    this.type = type
  }

  isGround(): boolean {
    return this.type.isGround()
  }

  isWall(): boolean {
    return this.type.isWall()
  }

  isWalkable(): boolean {
    return this.type.isWalkable()
  }

  getId(): string {
    return this.id
  }

  render(layers: PIXI.Container[], x: number, y: number, index: number): void {
    const spriteData = spritesData[this.type.getId()]

    if (!spriteData) {
      return
    }

    for (let i = 0; i < spriteData.height; i++) {
      for (let j = 0; j < spriteData.width; j++) {
        const tilesetTexture = PIXI.Assets.get(spriteData.tileset)

        const tileId = spriteData.states[0]
        const tilesWidth = tilesetTexture.width / TILE_SIZE

        const tilesetX = tileId % tilesWidth
        const tilesetY = Math.floor(tileId / tilesWidth)

        const textures = this.extractTextures(tilesetTexture.baseTexture, spriteData, j, i)
        const spriteX = x
        const spriteY = y + i * TILE_SIZE - spriteData.height * TILE_SIZE + TILE_SIZE

        let sprite

        if (spriteData.states.length > 1) {
          sprite = this.createAnimatedSprite(textures, spriteX, spriteY, spriteData)
        } else {
          sprite = this.createSprite(textures[0], spriteX, spriteY, spriteData)
        }

        sprite.anchor.set(0, 0)
        sprite.zIndex = 0

        if (this.type.isGround()) {
          layers[0].addChild(sprite)
        } else {
          layers[spriteData.height - i + spriteData.y + index].addChild(sprite)
        }

        this.sprites.push(sprite)
      }
    }
  }

  private extractTextures(
    source: PIXI.BaseTexture,
    spriteData: any,
    x: number,
    y: number
  ): PIXI.Texture[] {
    const textures: PIXI.Texture[] = []
    const tilesWidth = source.width / TILE_SIZE

    for (const state of spriteData.states) {
      const tilesetX = state % tilesWidth
      const tilesetY = Math.floor(state / tilesWidth)

      const textureRect = new PIXI.Rectangle(
        (tilesetX + x) * TILE_SIZE,
        (tilesetY + y) * TILE_SIZE,
        TILE_SIZE,
        TILE_SIZE
      )
      const texture = new PIXI.Texture({ source: source.source, frame: textureRect })
      textures.push(texture)
    }

    return textures
  }

  private createSprite(texture: PIXI.Texture, x: number, y: number, spriteData: any): PIXI.Sprite {
    const sprite = new PIXI.Sprite(texture)

    sprite.position.set(x, y)

    return sprite
  }

  private createAnimatedSprite(
    textures: PIXI.Texture[],
    x: number,
    y: number,
    spriteData: any
  ): PIXI.AnimatedSprite {
    const sprite = new PIXI.AnimatedSprite(textures)

    sprite.position.set(x, y)
    sprite.animationSpeed = spriteData.animation_speed || 0.1
    sprite.play()

    return sprite
  }

  destroy(): void {
    for (const sprite of this.sprites) {
      sprite.destroy()
    }
  }
}

export { Item }
