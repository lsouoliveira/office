import { Player } from '../player'
import { World } from '../world'
import DefaultProjectile from './default_projectile'
import { Tile } from '../map/tile'

class SummonObjectProjectile extends DefaultProjectile {
  static RADIUS = 8
  private summonPosition: { x: number; y: number }
  private caster: Player

  constructor(
    world: World,
    summonPosition: { x: number; y: number },
    caster: Player,
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
    this.caster = caster
  }

  onEffect(target: any) {
    if (target instanceof Player && !target.isSitting()) {
      target.teleport(this.summonPosition.x, this.summonPosition.y)

      return
    }

    if (target instanceof Tile) {
      const item = target.getTopItemWithAction()

      if (!item) {
        return
      }

      const itemType = item.getType()

      if (itemType.getId() == '90001') {
        this.caster.drink()
      } else if (itemType.getId() == '90003') {
        this.caster.eat()
      }
    }
  }
}

export default SummonObjectProjectile
