import Ability from '../ability'
import SummonObjectProjectile from './../../projectiles/summon_object_projectile'
import { Player } from '../../player'
import { World } from '../../world'

class SummonObjectAbility implements Ability {
  private world: World

  constructor(world: World) {
    this.world = world
  }

  cast(caster: Player) {
    const casterPosition = caster.getPosition()
    const summonPosition = {
      x: casterPosition.x + caster.getDirectionVector().x * 16,
      y: casterPosition.y + caster.getDirectionVector().y * 16
    }
    const projectilePosition = {
      x:
        casterPosition.x +
        caster.getDirectionVector().x * (16 + SummonObjectProjectile.RADIUS) +
        Math.abs(caster.getDirectionVector().y) * 8,
      y:
        casterPosition.y +
        caster.getDirectionVector().y * (16 + SummonObjectProjectile.RADIUS) +
        Math.abs(caster.getDirectionVector().x) * 8
    }

    const projectile = new SummonObjectProjectile(
      this.world,
      summonPosition,
      projectilePosition,
      caster.getDirectionVector(),
      100,
      100
    )

    this.world.getProjectileSystem().addProjectile(projectile)
  }
}

export default SummonObjectAbility
