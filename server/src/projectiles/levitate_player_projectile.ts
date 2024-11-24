import Projectile from './projectile'
import { Player } from '../player'
import { World } from '../world'

class LevitatePlayerProjectile extends Projectile {
  static RADIUS = 8
  private world: World

  constructor(
    world: World,
    position: { x: number; y: number },
    direction: { x: number; y: number },
    speed: number,
    duration: number
  ) {
    super('levitate', position, direction, speed, duration, LevitatePlayerProjectile.RADIUS, true)

    this.world = world
  }

  onHit(target: any) {
    if (target instanceof Player) {
      target.levitate()
    }

    this.destroy()

    if (target instanceof Player) {
      this.world.sendMessage('explosion:added', {
        position: target.getCenterPosition(),
        type: 'green_2'
      })
    } else {
      this.world.sendMessage('explosion:added', {
        position: this.position,
        type: 'green_1'
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

export default LevitatePlayerProjectile
