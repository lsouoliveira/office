import Ability from '../ability'
import MemoryCharmProjectile from './../../projectiles/memory_charm_projectile'
import { Player } from '../../player'
import { World } from '../../world'

class MemoryCharmAbility implements Ability {
  private world: World

  constructor(world: World) {
    this.world = world
  }

  cast(caster: Player) {
    const casterPosition = caster.getPosition()
    const projectilePosition = {
      x:
        casterPosition.x +
        caster.getDirectionVector().x * (16 + MemoryCharmProjectile.RADIUS) +
        Math.abs(caster.getDirectionVector().y) * 8,
      y:
        casterPosition.y +
        caster.getDirectionVector().y * (16 + MemoryCharmProjectile.RADIUS) +
        Math.abs(caster.getDirectionVector().x) * 8
    }

    const projectile = new MemoryCharmProjectile(
      this.world,
      projectilePosition,
      caster.getDirectionVector(),
      70,
      100
    )

    this.world.getProjectileSystem().addProjectile(projectile)
  }
}

export default MemoryCharmAbility
