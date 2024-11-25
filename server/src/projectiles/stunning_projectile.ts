import { Player } from '../player'
import { World } from '../world'
import DefaultProjectile from './default_projectile'

class StunningProjectile extends DefaultProjectile {
  static RADIUS = 8

  constructor(
    world: World,
    position: { x: number; y: number },
    direction: { x: number; y: number },
    speed: number,
    duration: number
  ) {
    super(
      'stunning',
      world,
      position,
      direction,
      speed,
      duration,
      StunningProjectile.RADIUS,
      true,
      {
        hitPlayerExplosionType: 'blue_4',
        hitOtherExplosionType: 'blue_1'
      }
    )
  }

  onEffect(target: any) {
    if (target instanceof Player) {
      target.stun()
    }
  }
}

export default StunningProjectile
