import { Player } from '../player'
import { World } from '../world'
import DefaultProjectile from './default_projectile'

class SummonObjectProjectile extends DefaultProjectile {
  static RADIUS = 8
  private summonPosition: { x: number; y: number }

  constructor(
    world: World,
    summonPosition: { x: number; y: number },
    position: { x: number; y: number },
    direction: { x: number; y: number },
    speed: number,
    duration: number
  ) {
    super(
      'summon_object',
      world,
      position,
      direction,
      speed,
      duration,
      SummonObjectProjectile.RADIUS,
      true,
      {
        hitPlayerExplosionType: 'fire_2',
        hitOtherExplosionType: 'fire_1'
      }
    )

    this.summonPosition = summonPosition
  }

  onEffect(target: any) {
    if (target instanceof Player && !target.isSitting()) {
      target.teleport(this.summonPosition.x, this.summonPosition.y)
    }
  }
}

export default SummonObjectProjectile
