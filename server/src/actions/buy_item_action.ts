import { ActionHandler } from './action_handler'
import { Item } from '../items/item'
import { ItemType } from '../items/item_type'
import shopJson from '../../data/shop.json'

class BuyItemAction extends ActionHandler {
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
      const product = shopJson.products.find((item) => item.itemTypeId === this.data.itemTypeId)

      if (!product) {
        return {
          status: 404,
          body: {
            message: 'Product not found'
          }
        }
      }

      const foundItem = player
        .getInventory()
        .getItems()
        .find((inventoryItem) => {
          return inventoryItem.getItem().getType().getId() === product.itemTypeId
        })

      if (foundItem) {
        return {
          status: 400,
          body: {
            error: 'item_already_owned'
          }
        }
      }

      if (player.getMoney() < product.price) {
        return {
          status: 400,
          body: {
            error: 'insufficient_funds'
          }
        }
      }

      const itemTypeData = this.world.getItemById(product.itemTypeId)

      if (!itemTypeData) {
        return {
          status: 404,
          body: {
            message: 'Item type not found'
          }
        }
      }

      const equipment = this.world.createEquipment(itemTypeData.equipment_id)
      const itemType = new ItemType(
        product.itemTypeId,
        {
          isGround: itemTypeData.is_ground,
          isWalkable: itemTypeData.is_walkable,
          isWall: itemTypeData.is_wall,
          actionId: itemTypeData.action_id,
          facing: itemTypeData.facing,
          nextItemId: itemTypeData.next_item_id
        },
        equipment
      )
      const item = new Item(itemType)

      player.addMoney(-product.price)
      player.getInventory().addItem(item)

      return {
        status: 200,
        body: {}
      }
    }
  }
}

export { BuyItemAction }
