import Ability from '../ability'
import { Player } from '../../player'
import { World } from '../../world'
import PatronumProjectile from '../../projectiles/patronum_projectile'
import { TILE_SIZE } from '../../config'

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
        caster.getDirectionVector().x * (TILE_SIZE + PatronumProjectile.RADIUS) +
        (Math.abs(caster.getDirectionVector().y) * TILE_SIZE) / 2,
      y:
        casterPosition.y +
        caster.getDirectionVector().y * (TILE_SIZE + PatronumProjectile.RADIUS) +
        (Math.abs(caster.getDirectionVector().x) * TILE_SIZE) / 2
    }

    const projectile = new PatronumProjectile(
      this.world,
      projectilePosition,
      caster.getDirectionVector(),
      250,
      10
    )

    this.world.getProjectileSystem().addProjectile(projectile)
  }
}

export default SummonPatronusAbility
