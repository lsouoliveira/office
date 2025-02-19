import { ItemType } from './item_type'
import { Player, EquipmentType } from './../player'

const crypto = require('crypto')

class Item {
  private id: string
  private type: ItemType
  private occupiedBy?: Player

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

  isOccupied(): boolean {
    return !!this.occupiedBy
  }

  occupy(player: Player): void {
    this.occupiedBy = player
  }

  vacate(): void {
    this.occupiedBy = undefined
  }

  getActionId(): string | undefined {
    return this.type.getActionId()
  }

  getFacing(): string | undefined {
    return this.type.getFacing()
  }

  getId(): string {
    return this.id
  }

  getType(): ItemType {
    return this.type
  }

  getEquipmentId(): string | undefined {
    return this.type.getEquipmentId()
  }

  getEquipmentType(): EquipmentType | undefined {
    return this.type.getEquipmentType()
  }

  getNextItemId(): string | undefined {
    return this.type.getNextItemId()
  }

  getDescription(): string | undefined {
    return this.type.getDescription()
  }

  isDoor(): boolean {
    return this.type.isDoor()
  }

  toData() {
    return {
      id: this.id,
      itemType: this.type.toData()
    }
  }
}

export { Item }
