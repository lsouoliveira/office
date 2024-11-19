import { Item } from './../items/item'

const TILE_SIZE = 16

class Tile {
  private x: number
  private y: number
  private items: Item[]

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
    this.items = []
  }

  getX(): number {
    return this.x
  }

  getY(): number {
    return this.y
  }

  addItem(item: Item): void {
    this.items.push(item)
  }

  getTopItem(): Item {
    return this.items[this.items.length - 1]
  }

  getTopItemWithAction(): Item | undefined {
    return this.items.toReversed().find((item) => item.getActionId())
  }

  isEmpty(): boolean {
    return this.items.length === 0
  }

  removeTopItem(): Item | undefined {
    return this.items.pop()
  }

  isWalkable() {
    return this.items.every((item) => item.isWalkable())
  }

  removeItem(item: Item): void {
    const index = this.items.indexOf(item)

    if (index === -1) {
      throw new Error('Item not found')
    }

    this.items.splice(index, 1)
  }

  replaceItem(item: Item, newItem: Item): void {
    const index = this.items.indexOf(item)

    if (index === -1) {
      throw new Error('Item not found')
    }

    this.items[index] = newItem
  }

  toData() {
    return {
      x: this.x,
      y: this.y,
      items: this.items.map((item) => item.toData())
    }
  }
}

export { Tile, TILE_SIZE }
