import Ability from '../ability'
import LevitatePlayerProjectile from './../../projectiles/levitate_player_projectile'
import { Player } from '../../player'
import { World } from '../../world'
import { TILE_SIZE } from '../../config'

class LevitatePlayerAbility implements Ability {
  private world: World

  constructor(world: World) {
    this.world = world
  }

  cast(caster: Player) {
    const casterPosition = caster.getPosition()
    const projectilePosition = {
      x:
        casterPosition.x +
        caster.getDirectionVector().x * (TILE_SIZE + LevitatePlayerProjectile.RADIUS) +
        (Math.abs(caster.getDirectionVector().y) * TILE_SIZE) / 2,
      y:
        casterPosition.y +
        caster.getDirectionVector().y * (TILE_SIZE + LevitatePlayerProjectile.RADIUS) +
        (Math.abs(caster.getDirectionVector().x) * TILE_SIZE) / 2
    }

    const projectile = new LevitatePlayerProjectile(
      this.world,
      projectilePosition,
      caster.getDirectionVector(),
      300,
      100
    )

    this.world.getProjectileSystem().addProjectile(projectile)
  }
}

export default LevitatePlayerAbility
