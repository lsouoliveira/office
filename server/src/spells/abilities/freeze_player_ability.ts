import Ability from '../ability'
import FreezeProjectile from './../../projectiles/freeze_projectile'
import { Player } from '../../player'
import { World } from '../../world'

class FreezePlayerAbility implements Ability {
  private world: World

  constructor(world: World) {
    this.world = world
  }

  cast(caster: Player) {
    const casterPosition = caster.getPosition()
    const projectilePosition = {
      x:
        casterPosition.x +
        caster.getDirectionVector().x * (16 + FreezeProjectile.RADIUS) +
        Math.abs(caster.getDirectionVector().y) * 8,
      y:
        casterPosition.y +
        caster.getDirectionVector().y * (16 + FreezeProjectile.RADIUS) +
        Math.abs(caster.getDirectionVector().x) * 8
    }

    const projectile = new FreezeProjectile(
      this.world,
      projectilePosition,
      caster.getDirectionVector(),
      80,
      100
    )

    this.world.getProjectileSystem().addProjectile(projectile)
  }
}

export default FreezePlayerAbility
