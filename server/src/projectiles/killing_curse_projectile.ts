import { Player } from '../player'
import { World } from '../world'
import DefaultProjectile from './default_projectile'

class KillingCurseProjectile extends DefaultProjectile {
  static RADIUS = 8

  constructor(
    world: World,
    position: { x: number; y: number },
    direction: { x: number; y: number },
    speed: number,
    duration: number
  ) {
    super(
      'killing_curse',
      world,
      position,
      direction,
      speed,
      duration,
      KillingCurseProjectile.RADIUS,
      true,
      {
        hitPlayerExplosionType: 'green_4',
        hitOtherExplosionType: 'green_1'
      }
    )
  }

  onEffect(target: any) {
    if (target instanceof Player) {
      target.setName(target.getName() + ' 💀')
    }
  }
}

export default KillingCurseProjectile
