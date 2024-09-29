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
    return this.items.toReversed().find((item) => item.getActionId() !== undefined)
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

  toData() {
    return {
      x: this.x,
      y: this.y,
      items: this.items.map((item) => item.toData())
    }
  }
}

export { Tile, TILE_SIZE }
