import Projectile from './projectile'
import { Player } from '../player'
import { World } from '../world'

class PatronumProjectile extends Projectile {
  private world: World

  constructor(
    world: World,
    position: { x: number; y: number },
    direction: { x: number; y: number },
    speed: number,
    duration: number
  ) {
    super('patronum', position, direction, speed, duration)
    this.world = world
  }

  onHit() {
    this.destroy()
  }
}

export default PatronumProjectile
