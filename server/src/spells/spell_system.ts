import { Player } from './../player'
import Ability from './ability'
import { SPELLS } from './spells'
import FreezePlayerAbility from './abilities/freeze_player_ability'
import SummonPatronusAbility from './abilities/summon_patronus_ability'
import { World } from './../world'

class SpellSystem {
  private abilities: Record<string, Ability>
  private world: World

  constructor(world: World) {
    this.abilities = {}
    this.world = world

    this.abilities['freeze_player'] = new FreezePlayerAbility(world)
    this.abilities['summon_patronus'] = new SummonPatronusAbility(world)
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