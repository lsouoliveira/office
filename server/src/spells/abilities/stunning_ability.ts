import Ability from '../ability'
import StunningProjectile from './../../projectiles/stunning_projectile'
import { Player } from '../../player'
import { World } from '../../world'

class StunningAbility implements Ability {
  private world: World

  constructor(world: World) {
    this.world = world
  }

  cast(caster: Player) {
    const casterPosition = caster.getPosition()
    const projectilePosition = {
      x:
        casterPosition.x +
        caster.getDirectionVector().x * (16 + StunningProjectile.RADIUS) +
        Math.abs(caster.getDirectionVector().y) * 8,
      y:
        casterPosition.y +
        caster.getDirectionVector().y * (16 + StunningProjectile.RADIUS) +
        Math.abs(caster.getDirectionVector().x) * 8
    }

    const projectile = new StunningProjectile(
      this.world,
      projectilePosition,
      caster.getDirectionVector(),
      60,
      100
    )

    this.world.getProjectileSystem().addProjectile(projectile)
  }
}

export default StunningAbility
