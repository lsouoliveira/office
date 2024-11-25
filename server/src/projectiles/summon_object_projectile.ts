import Projectile from './projectile'
import { Player, EquipmentType } from '../player'
import { World } from '../world'

class SummonObjectProjectile extends Projectile {
  static RADIUS = 8
  private world: World
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
      position,
      direction,
      speed,
      duration,
      SummonObjectProjectile.RADIUS,
      true
    )

    this.world = world
    this.summonPosition = summonPosition
  }

  onHit(target: any) {
    if (target instanceof Player && !target.isSitting()) {
      target.teleport(this.summonPosition.x, this.summonPosition.y)
    }

    this.destroy()

    if (target instanceof Player) {
      this.world.sendMessage('explosion:added', {
        position: target.getCenterPosition(),
        type: 'fire_2'
      })
    } else {
      this.world.sendMessage('explosion:added', {
        position: this.position,
        type: 'fire_1'
      })
    }

    if (target instanceof Projectile) {
      target.destroy()

      this.world.sendMessage('explosion:added', {
        position: this.position,
        type: 'fire_3'
      })
    }
  }
}

export default SummonObjectProjectile
