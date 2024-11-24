import Projectile from './projectile'
import { Player } from '../player'
import { World } from '../world'

class PatronumProjectile extends Projectile {
  static RADIUS = 8

  private world: World

  constructor(
    world: World,
    position: { x: number; y: number },
    direction: { x: number; y: number },
    speed: number,
    duration: number
  ) {
    super('patronum', position, direction, speed, duration, PatronumProjectile.RADIUS)
    this.world = world
  }

  onHit() {
    this.destroy()
  }
}

export default PatronumProjectile
