import { Task } from './task'
import { Player, Equipment } from './../player'
import { Item } from './../items/item'

class EquipTempEquipmentTask extends Task {
  private player: Player
  private item: Item

  constructor(player: Player, item: Item) {
    super()

    this.player = player
    this.item = item
  }

  _perform() {
    this.player.equip(this.item)

    setTimeout(
      () => {
        const equipmentType = this.item.getEquipmentType()

        if (!equipmentType) {
          return
        }

        const item = this.player.getEquipment(equipmentType)

        if (item == this.item) {
          this.player.unequip(this.item)
        }
      },
      5 * 60 * 1000
    )

    this.markAsDone()
  }
}

export { EquipTempEquipmentTask }
