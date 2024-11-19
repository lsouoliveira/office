import { Item } from './../items/item'
import * as crypto from 'crypto'

class Reward {
  private id: string
  private item: Item
  private amount: number
  private x: number
  private y: number
  private durationTimer: number

  constructor(string, item: Item, amount: number, x: number, y: number, id?: string) {
    this.id = id || crypto.randomUUID().toString()
    this.item = item
    this.amount = amount
    this.x = x
    this.y = y
    this.durationTimer = 0
  }

  update(dt: number) {
    this.durationTimer += dt
  }

  get Id() {
    return this.id
  }

  get Item() {
    return this.item
  }

  get X() {
    return this.x
  }

  get Y() {
    return this.y
  }

  get Amount() {
    return this.amount
  }

  get DurationTimer() {
    return this.durationTimer
  }
}

export default Reward
