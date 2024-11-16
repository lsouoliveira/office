import { Equipment, EquipmentType } from './../player'

interface ItemTypeOptions {
  isGround: boolean
  isWalkable: boolean
  isWall?: boolean
  actionId?: string
  facing?: string
  nextItemId?: string
}

class ItemType {
  private id: string
  private _isGround: boolean
  private _isWalkable: boolean
  private _isWall: boolean
  private actionId?: string
  private facing?: string
  private nextItemId?: string
  private equipment?: Equipment

  constructor(id: string, options: ItemTypeOptions, equipment?: Equipment) {
    const { isGround, isWalkable, actionId, facing, isWall, nextItemId } = options

    this.id = id
    this._isGround = isGround
    this._isWalkable = isWalkable
    this._isWall = isWall || false
    this.actionId = actionId
    this.facing = facing
    this.equipment = equipment
    this.nextItemId = nextItemId
  }

  getId(): string {
    return this.id
  }

  isGround(): boolean {
    return this._isGround
  }

  isWalkable(): boolean {
    return this._isWalkable
  }

  isWall(): boolean {
    return this._isWall
  }

  getActionId(): string | undefined {
    return this.actionId
  }

  getFacing(): string | undefined {
    return this.facing
  }

  getEquipmentId(): string | undefined {
    return this.equipment?.getId()
  }

  getEquipmentType(): EquipmentType | undefined {
    return this.equipment?.getType()
  }

  getNextItemId(): string | undefined {
    return this.nextItemId
  }

  toData() {
    return {
      id: this.id,
      isGround: this._isGround,
      isWalkable: this._isWalkable,
      isWall: this._isWall,
      actionId: this.actionId,
      facing: this.facing,
      equipmentId: this.equipment?.getId(),
      nextItemId: this.nextItemId
    }
  }
}

export { ItemType }
