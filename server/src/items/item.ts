import { ItemType } from './item_type'

const crypto = require('crypto')

class Item {
  private id: string
  private type: ItemType

  constructor(type: ItemType, id?: string) {
    this.id = id || crypto.randomUUID()
    this.type = type
  }

  isGround(): boolean {
    return this.type.isGround()
  }

  isWalkable(): boolean {
    return this.type.isWalkable()
  }

  getId(): string {
    return this.id
  }

  getType(): ItemType {
    return this.type
  }

  toData() {
    return {
      id: this.id,
      itemType: this.type.toData()
    }
  }
}

export { Item }
