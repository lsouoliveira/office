import SpellData from './spell_data'

const SPELLS = [
  new SpellData({
    id: 1,
    spelling: 'Petrificus Totalus',
    abilityName: 'freeze_player',
    cooldown: 5
  }),
  new SpellData({
    id: 2,
    spelling: 'Expecto Patronum',
    abilityName: 'summon_patronus',
    cooldown: 5
  })
]

const getSpellData = (spelling: string): SpellData | undefined => {
  return SPELLS.find((spell) => spell.spelling.toLocaleLowerCase() === spelling.toLocaleLowerCase())
}

const spellExists = (spelling: string): boolean => {
  return getSpellData(spelling) !== undefined
}

export { SPELLS, getSpellData, spellExists }
