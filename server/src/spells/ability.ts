import { Player } from '../player'

interface Ability {
  cast(caster: Player): void
}

export default Ability
