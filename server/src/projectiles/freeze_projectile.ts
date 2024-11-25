import { Player } from '../player'
import { World } from '../world'
import DefaultProjectile from './default_projectile'

class FreezeProjectile extends DefaultProjectile {
  static RADIUS = 8

  constructor(
    world: World,
    position: { x: number; y: number },
    direction: { x: number; y: number },
    speed: number,
    duration: number
  ) {
    super('freeze', world, position, direction, speed, duration, FreezeProjectile.RADIUS, true, {
      hitPlayerExplosionType: 'purple_2',
      hitOtherExplosionType: 'purple_1'
    })
  }

  onEffect(target: any) {
    if (target instanceof Player) {
      target.freeze()
    }
  }
}

export default FreezeProjectile
