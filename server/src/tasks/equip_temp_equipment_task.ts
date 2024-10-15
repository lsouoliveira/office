import { Task } from './task'
import { Player, Equipment } from './../player'

class EquipTempEquipmentTask extends Task {
  private player: Player
  private equipment: Equipment

  constructor(player: Player, equipment: Equipment) {
    super()

    this.player = player
    this.equipment = equipment
  }

  _perform() {
    this.player.equip(this.equipment)

    setTimeout(
      () => {
        const equipment = this.player.getEquipment(this.equipment.getType())

        if (equipment == this.equipment) {
          this.player.unequip(this.equipment)
        }
      },
      5 * 60 * 1000
    )

    this.markAsDone()
  }
}

export { EquipTempEquipmentTask }
