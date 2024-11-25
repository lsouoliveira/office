import Projectile from './projectile'
import { Player } from '../player'
import { World } from '../world'
import DefaultProjectile from './default_projectile'

class LevitatePlayerProjectile extends DefaultProjectile {
  static RADIUS = 8

  constructor(
    world: World,
    position: { x: number; y: number },
    direction: { x: number; y: number },
    speed: number,
    duration: number
  ) {
    super(
      'levitate',
      world,
      position,
      direction,
      speed,
      duration,
      LevitatePlayerProjectile.RADIUS,
      true,
      {
        hitPlayerExplosionType: 'green_2',
        hitOtherExplosionType: 'green_1'
      }
    )
  }

  onEffect(target: any) {
    if (target instanceof Player) {
      target.levitate()
    }
  }
}

export default LevitatePlayerProjectile
