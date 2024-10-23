import * as PIXI from 'pixi.js'
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

  removeItem(id: string): void {
    const item = this.items.find((item) => item.getId() === id)

    if (!item) {
      return
    }

    this.items = this.items.filter((item) => item.getId() !== id)
    item.destroy()
  }

  getTopItem(): Item {
    return this.items[this.items.length - 1]
  }

  isEmpty(): boolean {
    return this.items.length === 0
  }

  isWalkable(): boolean {
    return this.items.every((item) => item.isWalkable())
  }

  render(layers: PIXI.Container[], x: number, y: number): void {
    this.items.forEach((item) => {
      item.render(layers, x + this.x * TILE_SIZE, y + this.y * TILE_SIZE, this.getItemHeight(item))
    })
  }

  getItemHeight(item: Item) {
    const nonGroundItems = this.items.filter((item) => !item.isGround() && !item.isWall())

    return nonGroundItems.indexOf(item)
  }

  getItem(id: string): Item | undefined {
    return this.items.find((item) => item.getId() === id)
  }

  replaceItem(oldId: string, newItem: Item): void {
    const index = this.items.findIndex((item) => item.getId() === oldId)

    if (index === -1) {
      return
    }

    this.items[index] = newItem
  }
}

export { Tile, TILE_SIZE }
