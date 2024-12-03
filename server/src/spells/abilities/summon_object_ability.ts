import Ability from '../ability'
import SummonObjectProjectile from './../../projectiles/summon_object_projectile'
import { Player } from '../../player'
import { World } from '../../world'
import { TILE_SIZE } from '../../config'

class SummonObjectAbility implements Ability {
  private world: World

  constructor(world: World) {
    this.world = world
  }

  cast(caster: Player) {
    const casterPosition = caster.getPosition()
    const summonPosition = {
      x: casterPosition.x + caster.getDirectionVector().x * TILE_SIZE,
      y: casterPosition.y + caster.getDirectionVector().y * TILE_SIZE
    }
    const projectilePosition = {
      x:
        casterPosition.x +
        caster.getDirectionVector().x * (TILE_SIZE + SummonObjectProjectile.RADIUS) +
        (Math.abs(caster.getDirectionVector().y) * TILE_SIZE) / 2,
      y:
        casterPosition.y +
        caster.getDirectionVector().y * (TILE_SIZE + SummonObjectProjectile.RADIUS) +
        (Math.abs(caster.getDirectionVector().x) * TILE_SIZE) / 2
    }

    const projectile = new SummonObjectProjectile(
      this.world,
      summonPosition,
      caster,
      projectilePosition,
      caster.getDirectionVector(),
      300,
      100
    )

    this.world.getProjectileSystem().addProjectile(projectile)
  }
}

export default SummonObjectAbility
