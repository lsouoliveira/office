import * as PIXI from 'pixi.js'
import { TILE_SIZE } from './map/tile'
import spritesData from './data/sprites.json'

function extractTextures(
  source: PIXI.BaseTexture,
  spriteData: any,
  x: number,
  y: number,
  tileSize: number
): PIXI.Texture[] {
  const textures: PIXI.Texture[] = []
  const tilesWidth = source.width / tileSize

  for (const state of spriteData.states) {
    const tilesetX = state % tilesWidth
    const tilesetY = Math.floor(state / tilesWidth)

    const textureRect = new PIXI.Rectangle(
      (tilesetX + x) * tileSize,
      (tilesetY + y) * tileSize,
      tileSize,
      tileSize
    )
    const texture = new PIXI.Texture({ source: source.source, frame: textureRect })
    textures.push(texture)
  }

  return textures
}

function createSprite(texture: PIXI.Texture, spriteData: any): PIXI.Sprite {
  const sprite = new PIXI.Sprite(texture)

  sprite.width = TILE_SIZE
  sprite.height = TILE_SIZE

  return sprite
}

function createAnimatedSprite(textures: PIXI.Texture[], spriteData: any): PIXI.AnimatedSprite {
  const sprite = new PIXI.AnimatedSprite(textures)

  sprite.animationSpeed = spriteData.animation_speed || 0.1
  sprite.play()

  return sprite
}

const createSpriteContainer = (spriteId) => {
  const spriteData = spritesData[spriteId]

  if (!spriteData) {
    return
  }

  const spriteContainer = new PIXI.Container()

  for (let i = 0; i < spriteData.height; i++) {
    for (let j = 0; j < spriteData.width; j++) {
      const tilesetTexture = PIXI.Assets.get(spriteData.tileset)
      const tileSize = spriteData.tileSize || TILE_SIZE
      const textures = extractTextures(tilesetTexture.baseTexture, spriteData, j, i, tileSize)

      let sprite

      if (spriteData.states.length > 1) {
        sprite = createAnimatedSprite(textures, spriteData)
      } else {
        sprite = createSprite(textures[0], spriteData)
      }

      sprite.anchor.set(0, 0)
      sprite.zIndex = 0
      sprite.width = TILE_SIZE
      sprite.height = TILE_SIZE
      sprite.position.set(j * TILE_SIZE, i * TILE_SIZE)

      spriteContainer.addChild(sprite)
    }

    return spriteContainer
  }
}

const extractSpriteTextures = (spriteId: any) => {
  const spriteData = spritesData[spriteId]

  if (!spriteData) {
    return
  }

  const tilesetTexture = PIXI.Assets.get(spriteData.tileset)
  const tileSize = spriteData.tileSize || TILE_SIZE

  return extractTextures(tilesetTexture.baseTexture, spriteData, 0, 0, tileSize)
}

const createAnimatedSpriteFromTexture = (
  textureName: string,
  tileId: number,
  width: number,
  height: number,
  tileSize: number,
  frames: number
) => {
  const spritesheetTexture = PIXI.Assets.get(textureName)
  const x = tileId % (spritesheetTexture.width / tileSize)
  const y = Math.floor(tileId / (spritesheetTexture.width / tileSize))
  const textures = []

  for (let i = 0; i < frames; i++) {
    const textureRect = new PIXI.Rectangle(
      (x + i) * tileSize,
      y * tileSize,
      width * tileSize,
      height * tileSize
    )
    const texture = new PIXI.Texture({
      source: spritesheetTexture.source,
      frame: textureRect
    })

    textures.push(texture)
  }

  const sprite = new PIXI.AnimatedSprite(textures)

  return sprite
}

export { createSpriteContainer, extractSpriteTextures, createAnimatedSpriteFromTexture }
