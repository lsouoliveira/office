import Projectile from './projectile'
import { Player, EquipmentType } from '../player'
import { World } from '../world'

class KillingCurseProjectile extends Projectile {
  static RADIUS = 8
  private world: World

  constructor(
    world: World,
    position: { x: number; y: number },
    direction: { x: number; y: number },
    speed: number,
    duration: number
  ) {
    super(
      'killing_curse',
      position,
      direction,
      speed,
      duration,
      KillingCurseProjectile.RADIUS,
      true
    )

    this.world = world
  }

  onHit(target: any) {
    if (target instanceof Player) {
      target.setName(target.getName() + ' 💀')
    }

    this.destroy()

    if (target instanceof Player) {
      this.world.sendMessage('explosion:added', {
        position: target.getCenterPosition(),
        type: 'green_4'
      })
    } else {
      this.world.sendMessage('explosion:added', {
        position: this.position,
        type: 'green_1'
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

export default KillingCurseProjectile
