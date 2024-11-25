import { Player, EquipmentType } from '../player'
import { World } from '../world'
import DefaultProjectile from './default_projectile'

class DisarmProjectile extends DefaultProjectile {
  static RADIUS = 8

  constructor(
    world: World,
    position: { x: number; y: number },
    direction: { x: number; y: number },
    speed: number,
    duration: number
  ) {
    super('disarm', world, position, direction, speed, duration, DisarmProjectile.RADIUS, true, {
      hitPlayerExplosionType: 'fire_2',
      hitOtherExplosionType: 'fire_1',
      clashExplosionType: 'fire_3'
    })
  }

  onEffect(target: any) {
    if (target instanceof Player) {
      const item = target.getEquipment(EquipmentType.Wand)

      if (item) {
        target.unequip(item)
      }
    }
  }
}

export default DisarmProjectile
