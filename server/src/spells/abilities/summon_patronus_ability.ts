import Ability from '../ability'
import { Player } from '../../player'
import { World } from '../../world'
import PatronumProjectile from '../../projectiles/patronum_projectile'

class SummonPatronusAbility implements Ability {
  private world: World

  constructor(world: World) {
    this.world = world
  }

  cast(caster: Player) {
    caster.patrono()

    const casterPosition = caster.getPosition()
    const projectilePosition = {
      x:
        casterPosition.x +
        caster.getDirectionVector().x * (16 + PatronumProjectile.RADIUS) +
        Math.abs(caster.getDirectionVector().y) * 8,
      y:
        casterPosition.y +
        caster.getDirectionVector().y * (16 + PatronumProjectile.RADIUS) +
        Math.abs(caster.getDirectionVector().x) * 8
    }

    const projectile = new PatronumProjectile(
      this.world,
      projectilePosition,
      caster.getDirectionVector(),
      40,
      10
    )

    this.world.getProjectileSystem().addProjectile(projectile)
  }
}

export default SummonPatronusAbility
