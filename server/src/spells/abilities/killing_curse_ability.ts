import Ability from '../ability'
import KillingCurseProjectile from './../../projectiles/killing_curse_projectile'
import { Player } from '../../player'
import { World } from '../../world'
import { TILE_SIZE } from '../../config'

class KillingCurseAbility implements Ability {
  private world: World

  constructor(world: World) {
    this.world = world
  }

  cast(caster: Player) {
    const casterPosition = caster.getPosition()
    const projectilePosition = {
      x:
        casterPosition.x +
        TILE_SIZE / 2 +
        caster.getDirectionVector().x * (TILE_SIZE / 2 + KillingCurseProjectile.RADIUS),
      y:
        casterPosition.y +
        caster.getDirectionVector().y * (TILE_SIZE + KillingCurseProjectile.RADIUS) +
        (Math.abs(caster.getDirectionVector().x) * TILE_SIZE) / 2
    }

    const projectile = new KillingCurseProjectile(
      this.world,
      projectilePosition,
      caster.getDirectionVector(),
      300,
      100
    )

    this.world.getProjectileSystem().addProjectile(projectile)
  }
}

export default KillingCurseAbility
