import Projectile from './projectile'
import { Player, EquipmentType } from '../player'
import { World } from '../world'
import DefaultProjectile from './default_projectile'

class MemoryCharmProjectile extends DefaultProjectile {
  static RADIUS = 8

  constructor(
    world: World,
    position: { x: number; y: number },
    direction: { x: number; y: number },
    speed: number,
    duration: number
  ) {
    super(
      'memory_charm',
      world,
      position,
      direction,
      speed,
      duration,
      MemoryCharmProjectile.RADIUS,
      true,
      {
        hitPlayerExplosionType: 'blue_2',
        hitOtherExplosionType: 'blue_1'
      }
    )
  }

  onEffect(target: any) {
    if (target instanceof Player) {
      this.world.sendMessage('player:memory_charm', {
        playerId: target.getId()
      })
    }
  }
}

export default MemoryCharmProjectile
