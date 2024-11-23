class SpellData {
  public readonly id: number
  public readonly spelling: string
  public readonly abilityName: string
  public readonly cooldown: number

  constructor({
    id,
    spelling,
    abilityName,
    cooldown
  }: {
    id: number
    spelling: string
    abilityName: string
    cooldown: number
  }) {
    this.id = id
    this.spelling = spelling
    this.abilityName = abilityName
    this.cooldown = cooldown
  }
}

export default SpellData
