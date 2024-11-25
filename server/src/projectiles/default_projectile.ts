import Projectile from './projectile'
import { Player } from '../player'
import { World } from '../world'

interface DefaultProjectileOptions {
  hitPlayerExplosionType: string
  hitOtherExplosionType: string
  clashExplosionType?: string
}

const DEFAULT_CLASH_EXPLOSION_TYPE = 'fire_3'

class DefaultProjectile extends Projectile {
  private _world: World
  private hitPlayerExplosionType: string
  private hitOtherExplosionType: string
  private clashExplosionType?: string

  constructor(
    projectileName: string,
    world: World,
    position: { x: number; y: number },
    direction: { x: number; y: number },
    speed: number,
    duration: number,
    radius: number,
    canClash: boolean = false,
    options: DefaultProjectileOptions
  ) {
    super(projectileName, position, direction, speed, duration, radius, canClash)

    this._world = world
    this.hitPlayerExplosionType = options.hitPlayerExplosionType
    this.hitOtherExplosionType = options.hitOtherExplosionType
    this.clashExplosionType = options.clashExplosionType
  }

  get world() {
    return this._world
  }

  onHit(target: any) {
    this.destroy()

    if (target instanceof Player) {
      this.world.sendMessage('explosion:added', {
        position: target.getCenterPosition(),
        type: this.hitPlayerExplosionType
      })
    } else {
      this.world.sendMessage('explosion:added', {
        position: this.position,
        type: this.hitOtherExplosionType
      })
    }

    if (target instanceof Projectile) {
      target.destroy()

      this.world.sendMessage('explosion:added', {
        position: this.position,
        type: this.clashExplosionType || DEFAULT_CLASH_EXPLOSION_TYPE
      })
    }

    this.onEffect(target)
  }

  onEffect(target: any) {}
}

export default DefaultProjectile
