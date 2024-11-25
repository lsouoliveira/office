import Projectile from './projectile'
import { Player, EquipmentType } from '../player'
import { World } from '../world'

class MemoryCharmProjectile extends Projectile {
  static RADIUS = 8
  private world: World

  constructor(
    world: World,
    position: { x: number; y: number },
    direction: { x: number; y: number },
    speed: number,
    duration: number
  ) {
    super('memory_charm', position, direction, speed, duration, MemoryCharmProjectile.RADIUS, true)

    this.world = world
  }

  onHit(target: any) {
    if (target instanceof Player) {
      this.world.sendMessage('player:memory_charm', {
        playerId: target.getId()
      })
    }

    this.destroy()

    if (target instanceof Player) {
      this.world.sendMessage('explosion:added', {
        position: target.getCenterPosition(),
        type: 'blue_2'
      })
    } else {
      this.world.sendMessage('explosion:added', {
        position: this.position,
        type: 'blue_1'
      })
    }

    if (target instanceof Projectile) {
      target.destroy()

      this.world.sendMessage('explosion:added', {
        position: this.position,
        type: 'fire_1'
      })
    }
  }
}

export default MemoryCharmProjectile
