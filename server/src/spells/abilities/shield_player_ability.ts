import Ability from '../ability'
import DisarmProjectile from './../../projectiles/disarm_projectile'
import { Player } from '../../player'
import { World } from '../../world'

class ShieldPlayerAbility implements Ability {
  private world: World

  constructor(world: World) {
    this.world = world
  }

  cast(caster: Player) {
    caster.protego()

    this.world.sendMessage('explosion:added', {
      position: caster.getCenterPosition(),
      type: 'blue_2'
    })
  }
}

export default ShieldPlayerAbility
