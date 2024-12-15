import Ability from '../ability'
import ControlPlayerProjectile from './../../projectiles/control_player_projectile'
import { Player } from '../../player'
import { World } from '../../world'
import { TILE_SIZE } from '../../config'

class ControlPlayerAbility implements Ability {
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
        caster.getDirectionVector().x * (TILE_SIZE / 2 + ControlPlayerProjectile.RADIUS),
      y:
        casterPosition.y +
        caster.getDirectionVector().y * (TILE_SIZE + ControlPlayerProjectile.RADIUS) +
        (Math.abs(caster.getDirectionVector().x) * TILE_SIZE) / 2
    }

    const projectile = new ControlPlayerProjectile(
      this.world,
      caster,
      projectilePosition,
      caster.getDirectionVector(),
      300,
      100
    )

    this.world.getProjectileSystem().addProjectile(projectile)
  }
}

export default ControlPlayerAbility
