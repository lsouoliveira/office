import Ability from '../ability'
import LevitatePlayerProjectile from './../../projectiles/levitate_player_projectile'
import { Player } from '../../player'
import { World } from '../../world'

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
        caster.getDirectionVector().x * (16 + LevitatePlayerProjectile.RADIUS) +
        Math.abs(caster.getDirectionVector().y) * 8,
      y:
        casterPosition.y +
        caster.getDirectionVector().y * (16 + LevitatePlayerProjectile.RADIUS) +
        Math.abs(caster.getDirectionVector().x) * 8
    }

    const projectile = new LevitatePlayerProjectile(
      this.world,
      projectilePosition,
      caster.getDirectionVector(),
      80,
      100
    )

    this.world.getProjectileSystem().addProjectile(projectile)
  }
}

export default LevitatePlayerAbility
