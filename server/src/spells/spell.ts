import SpellData from './spell_data'

class Spell {
  private spellData: SpellData
  private cooldownTimer: number

  constructor(spellData: SpellData) {
    this.spellData = spellData
    this.cooldownTimer = 0
  }

  update(dt: number) {
    if (this.cooldownTimer > 0) {
      this.cooldownTimer -= dt
    }
  }

  canCast() {
    return this.cooldownTimer <= 0
  }

  cast() {
    this.cooldownTimer = this.spellData.cooldown
  }

  get Id() {
    return this.spellData.id
  }
}

export default Spell
