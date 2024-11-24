import Projectile from './projectile'
import { Player, EquipmentType } from '../player'
import { World } from '../world'

class DisarmProjectile extends Projectile {
  static RADIUS = 8
  private world: World

  constructor(
    world: World,
    position: { x: number; y: number },
    direction: { x: number; y: number },
    speed: number,
    duration: number
  ) {
    super('disarm', position, direction, speed, duration, DisarmProjectile.RADIUS, true)

    this.world = world
  }

  onHit(target: any) {
    if (target instanceof Player) {
      const item = target.getEquipment(EquipmentType.Wand)

      if (item) {
        target.unequip(item)
      }
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

export default DisarmProjectile
