import Ability from '../ability'
import DisarmProjectile from './../../projectiles/disarm_projectile'
import { Player } from '../../player'
import { World } from '../../world'

class DisarmPlayerAbility implements Ability {
  private world: World

  constructor(world: World) {
    this.world = world
  }

  cast(caster: Player) {
    const casterPosition = caster.getPosition()
    const projectilePosition = {
      x:
        casterPosition.x +
        caster.getDirectionVector().x * (16 + DisarmProjectile.RADIUS) +
        Math.abs(caster.getDirectionVector().y) * 8,
      y:
        casterPosition.y +
        caster.getDirectionVector().y * (16 + DisarmProjectile.RADIUS) +
        Math.abs(caster.getDirectionVector().x) * 8
    }

    const projectile = new DisarmProjectile(
      this.world,
      projectilePosition,
      caster.getDirectionVector(),
      60,
      100
    )

    this.world.getProjectileSystem().addProjectile(projectile)
  }
}

export default DisarmPlayerAbility
