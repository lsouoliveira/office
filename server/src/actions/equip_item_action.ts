import { ActionHandler } from './action_handler'

class EquipItemAction extends ActionHandler {
  async handle() {
    const player = this.world.getPlayerBySessionId(this.socket.sessionId)

    if (!player) {
      return {
        status: 404,
        body: {
          message: 'Player not found'
        }
      }
    } else {
      const inventoryItem = player.getInventory().getItemByID(this.data.itemId)

      if (!inventoryItem) {
        return {
          status: 404,
          body: {
            message: 'inventoryItem not found'
          }
        }
      }

      player.equip(inventoryItem.item)

      return {
        status: 200,
        body: {}
      }
    }
  }
}

export { EquipItemAction }
