import Ability from '../ability'
import KillingCurseProjectile from './../../projectiles/killing_curse_projectile'
import { Player } from '../../player'
import { World } from '../../world'

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
        caster.getDirectionVector().x * (16 + KillingCurseProjectile.RADIUS) +
        Math.abs(caster.getDirectionVector().y) * 8,
      y:
        casterPosition.y +
        caster.getDirectionVector().y * (16 + KillingCurseProjectile.RADIUS) +
        Math.abs(caster.getDirectionVector().x) * 8
    }

    console.log(projectilePosition)

    const projectile = new KillingCurseProjectile(
      this.world,
      projectilePosition,
      caster.getDirectionVector(),
      70,
      100
    )

    this.world.getProjectileSystem().addProjectile(projectile)
  }
}

export default KillingCurseAbility
