import * as PIXI from 'pixi.js'
import { type Entity } from './entity'

enum ProjectileType {
  FREEZE = 'freeze',
  PATRONUM = 'patronum'
}

const SPRITESHEET_WIDTH = 36
const SPRITESHEET_HEIGHT = 13

const PROJECTILES = {
  [ProjectileType.FREEZE]: {
    assetPath: 'purple_effects.png',
    tileId: 14,
    width: 1,
    height: 1,
    frames: 2,
    loop: true,
    animationSpeed: 0.05
  },
  [ProjectileType.PATRONUM]: {
    assetPath: 'blue_effects.png',
    tileId: 117,
    width: 1,
    height: 2,
    frames: 4,
    loop: false,
    rotation: Math.PI / 2,
    animationSpeed: 0.25
  }
}

class Projectile extends PIXI.Container implements Entity {
  private id: string
  private sprite: PIXI.AnimatedSprite
  private speed: number
  private direction: { x: number; y: number }

  constructor(
    id: string,
    sprite: PIXI.AnimatedSprite,
    speed: number,
    direction: { x: number; y: number }
  ) {
    super()

    this.id = id
    this.sprite = sprite
    this.speed = speed
    this.direction = direction

    this.addChild(this.sprite)
  }

  updateEntity(dt: number) {}

  fixedUpdateEntity(dt: number) {
    this.x += this.direction.x * this.speed * dt
    this.y += this.direction.y * this.speed * dt
  }

  destroy() {
    this.emit('destroy')
    super.destroy()
  }

  static createProjectile(
    id: string,
    type: ProjectileType,
    x: number,
    y: number,
    direction: { x: number; y: number },
    speed: number,
    duration: number
  ) {
    const { assetPath, tileId, width, height, frames, loop, rotation, animationSpeed } =
      PROJECTILES[type]
    const tileX = tileId % SPRITESHEET_WIDTH
    const tileY = Math.floor(tileId / SPRITESHEET_WIDTH)

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

    const defaultRotation = Math.atan2(direction.y, direction.x) + 1.5 * Math.PI

    const sprite = new PIXI.AnimatedSprite(textures)
    sprite.anchor.set(0.5)
    sprite.animationSpeed = animationSpeed
    sprite.loop = loop
    sprite.rotation = defaultRotation + (rotation || 0)
    sprite.play()

    const projectile = new Projectile(id, sprite, speed, direction)
    projectile.position.set(x, y)

    return projectile
  }
}

export { Projectile, ProjectileType }