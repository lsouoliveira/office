import { Item } from '../items/item'

class InventoryItem {
  private item: Item

  constructor(item: Item) {
    this.item = item
  }

  getItemID() {
    return this.item.getId()
  }

  serialize() {
    return {
      item: this.item.toData()
    }
  }
}

export { InventoryItem }
