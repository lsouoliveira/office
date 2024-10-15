import { Task } from './task'
import { Player, Equipment } from './../player'

class EquipEquipment extends Task {
  private player: Player
  private equipment: Equipment

  constructor(player: Player, equipment: Equipment) {
    super()

    this.player = player
    this.equipment = equipment
  }

  _perform() {
    this.player.equip(this.equipment)

    this.markAsDone()
  }
}

export { EquipEquipment }
