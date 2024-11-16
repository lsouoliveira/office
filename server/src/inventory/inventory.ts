import { InventoryItem } from './inventory_item'
import { Item } from '../items/item'

class Inventory {
  private items: InventoryItem[] = []

  addItem(item: Item): void {
    const inventoryItem = this.items.find(
      (inventoryItem) => inventoryItem.getItemID() === item.getId()
    )

    if (inventoryItem) {
      return
    }

    this.items.push(new InventoryItem(item))
  }

  removeItem(item: Item): void {
    const inventoryItem = this.items.find(
      (inventoryItem) => inventoryItem.getItemID() === item.getId()
    )

    if (inventoryItem) {
      this.items = this.items.filter((inventoryItem) => inventoryItem.getItemID() !== item.getId())
    }
  }

  getItems(): InventoryItem[] {
    return [...this.items]
  }

  getItemByID(id: string): InventoryItem | undefined {
    return this.items.find((inventoryItem) => inventoryItem.getItemID() === id)
  }

  serialize() {
    return this.items.map((item) => item.serialize())
  }
}

export { Inventory }
