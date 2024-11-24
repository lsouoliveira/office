import Projectile from './projectile'
import { Player } from '../player'
import { World } from '../world'

class FreezeProjectile extends Projectile {
  static RADIUS = 8
  private world: World

  constructor(
    world: World,
    position: { x: number; y: number },
    direction: { x: number; y: number },
    speed: number,
    duration: number
  ) {
    super('freeze', position, direction, speed, duration, FreezeProjectile.RADIUS, true)

    this.world = world
  }

  onHit(target: any) {
    if (target instanceof Player) {
      target.freeze()
    }

    this.destroy()

    if (target instanceof Player) {
      this.world.sendMessage('explosion:added', {
        position: target.getCenterPosition(),
        type: 'purple_2'
      })
    } else {
      this.world.sendMessage('explosion:added', {
        position: this.position,
        type: 'purple_1'
      })
    }

    if (target instanceof Projectile) {
      target.destroy()

      this.world.sendMessage('explosion:added', {
        position: this.position,
        type: 'fire_3'
      })
    }
  }
}

export default FreezeProjectile
