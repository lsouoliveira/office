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

  render(stage: PIXI.Container, x: number, y: number): void {
    this.items.forEach((item) => {
      item.render(stage, x + this.x * TILE_SIZE, y + this.y * TILE_SIZE)
    })
  }
}

export { Tile, TILE_SIZE }
