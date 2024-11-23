import Projectile from './projectile'
import { Player } from '../player'
import { World } from '../world'

class FreezeProjectile extends Projectile {
  private world: World

  constructor(
    world: World,
    position: { x: number; y: number },
    direction: { x: number; y: number },
    speed: number,
    duration: number
  ) {
    super('freeze', position, direction, speed, duration)

    this.world = world
  }

  onHit(target: any) {
    if (target instanceof Player) {
      target.freeze()
    }

    this.destroy()
    this.world.sendMessage('explosion:added', {
      position: this.position,
      type: 'freeze'
    })
  }
}

export default FreezeProjectile
