import { Player } from './../player'
import Ability from './ability'
import { SPELLS } from './spells'
import FreezePlayerAbility from './abilities/freeze_player_ability'
import SummonPatronusAbility from './abilities/summon_patronus_ability'
import DisarmPlayerAbility from './abilities/disarm_player_ability'
import KillingCurseAbility from './abilities/killing_curse_ability'
import StunningAbility from './abilities/stunning_ability'
import LevitatePlayerAbility from './abilities/levitate_player_ability'
import UnlockDoorAbility from './abilities/unlock_door_ability'
import SummonObjectAbility from './abilities/summon_object_ability'
import { World } from './../world'

class SpellSystem {
  private abilities: Record<string, Ability>
  private world: World

  constructor(world: World) {
    this.abilities = {}
    this.world = world

    this.abilities['freeze_player'] = new FreezePlayerAbility(world)
    this.abilities['summon_patronus'] = new SummonPatronusAbility(world)
    this.abilities['disarm_player'] = new DisarmPlayerAbility(world)
    this.abilities['killing_curse'] = new KillingCurseAbility(world)
    this.abilities['stunning'] = new StunningAbility(world)
    this.abilities['levitate_player'] = new LevitatePlayerAbility(world)
    this.abilities['unlock_door'] = new UnlockDoorAbility(world)
    this.abilities['summon_object'] = new SummonObjectAbility(world)
  }

  cast(player: Player, spellId: number) {
    const spellData = SPELLS.find((spell) => spell.id === spellId)

    if (!spellData) {
      return
    }

    const ability = this.abilities[spellData.abilityName]

    if (!ability) {
      return
    }

    player.castSpell(spellId)
    ability.cast(player)
  }
}

export default SpellSystem
