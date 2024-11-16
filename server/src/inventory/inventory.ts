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

  serialize(): string {
    return JSON.stringify(this.items.map((item) => item.serialize()))
  }
}

export { Inventory }
