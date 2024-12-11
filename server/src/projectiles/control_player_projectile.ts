import { Player } from '../player'
import { World } from '../world'
import DefaultProjectile from './default_projectile'

const FOLLOWING_DURATION = 10000

class ControlPlayerProjectile extends DefaultProjectile {
  static RADIUS = 8

  private caster: Player

  constructor(
    world: World,
    caster: Player,
    position: { x: number; y: number },
    direction: { x: number; y: number },
    speed: number,
    duration: number
  ) {
    super(
      'control_player',
      world,
      position,
      direction,
      speed,
      duration,
      ControlPlayerProjectile.RADIUS,
      true,
      {
        hitPlayerExplosionType: 'yellow_4',
        hitOtherExplosionType: 'yellow_1'
      }
    )

    this.caster = caster
  }

  onEffect(target: any) {
    if (target instanceof Player) {
      target.followForDuration(this.caster, FOLLOWING_DURATION)
    }
  }
}

export default ControlPlayerProjectile
