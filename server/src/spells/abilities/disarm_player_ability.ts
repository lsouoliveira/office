import Ability from '../ability'
import DisarmProjectile from './../../projectiles/disarm_projectile'
import { Player } from '../../player'
import { World } from '../../world'
import { TILE_SIZE } from '../../config'

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
        caster.getDirectionVector().x * (TILE_SIZE + DisarmProjectile.RADIUS) +
        (Math.abs(caster.getDirectionVector().y) * TILE_SIZE) / 2,
      y:
        casterPosition.y +
        caster.getDirectionVector().y * (TILE_SIZE + DisarmProjectile.RADIUS) +
        (Math.abs(caster.getDirectionVector().x) * TILE_SIZE) / 2
    }

    const projectile = new DisarmProjectile(
      this.world,
      projectilePosition,
      caster.getDirectionVector(),
      300,
      100
    )

    this.world.getProjectileSystem().addProjectile(projectile)
  }
}

export default DisarmPlayerAbility
