import * as PIXI from 'pixi.js'
import { type Entity } from './entity'

const EXPLOSION_SPRITESHEET_WIDTH = 36
const EXPLOSION_SPRITESHEET_HEIGHT = 13

enum ExplosionType {
  PURPLE_1 = 'purple_1',
  PURPLE_2 = 'purple_2'
}

const EXPLOSIONS = {
  [ExplosionType.PURPLE_1]: {
    assetPath: 'purple_effects.png',
    tileId: 246,
    width: 1,
    height: 1,
    frames: 6,
    loop: false,
    animationSpeed: 0.25
  },
  [ExplosionType.PURPLE_2]: {
    assetPath: 'purple_effects.png',
    tileId: 354,
    width: 1,
    height: 1,
    frames: 6,
    loop: false,
    animationSpeed: 0.1
  }
}

class Explosion extends PIXI.Container implements Entity {
  private id: string
  private sprite: PIXI.AnimatedSprite

  constructor(id: string, sprite: PIXI.AnimatedSprite) {
    super()

    this.id = id
    this.sprite = sprite

    this.addChild(this.sprite)
  }

  updateEntity(dt: number) {
    if (!this.sprite.playing) {
      this.destroy()
    }
  }

  fixedUpdateEntity(dt: number) {}

  destroy() {
    this.emit('destroy')
    super.destroy()
  }

  static createExplosion(id: string, type: ExplosionType, x: number, y: number) {
    const { assetPath, tileId, width, height, frames, loop, animationSpeed } = EXPLOSIONS[type]
    const tileX = tileId % EXPLOSION_SPRITESHEET_WIDTH
    const tileY = Math.floor(tileId / EXPLOSION_SPRITESHEET_WIDTH)

    const spritesheetTexture = PIXI.Assets.get(assetPath)
    const textures = []

    for (let i = 0; i < frames; i++) {
      const textureRect = new PIXI.Rectangle((tileX + i) * 16, tileY * 16, width * 16, height * 16)
      const texture = new PIXI.Texture({
        source: spritesheetTexture.source,
        frame: textureRect
      })

      textures.push(texture)
    }

    const sprite = new PIXI.AnimatedSprite(textures)
    sprite.anchor.set(0.5)
    sprite.animationSpeed = animationSpeed
    sprite.loop = loop
    sprite.play()

    const explosion = new Explosion(id, sprite)
    explosion.position.set(x, y)

    return explosion
  }
}

export { Explosion, ExplosionType }
