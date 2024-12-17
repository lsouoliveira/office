import { Equipment, EquipmentType } from './../player'

interface ItemTypeOptions {
  isGround: boolean
  isWalkable: boolean
  isWall?: boolean
  actionId?: string
  facing?: string
  nextItemId?: string
  description?: string
  isDoor: boolean
}

class ItemType {
  private id: string
  private _isGround: boolean
  private _isWalkable: boolean
  private _isWall: boolean
  private actionId?: string
  private facing?: string
  private nextItemId?: string
  private description?: string
  private equipment?: Equipment
  private _isDoor: boolean

  constructor(id: string, options: ItemTypeOptions, equipment?: Equipment) {
    const { isGround, isWalkable, actionId, facing, isWall, nextItemId, isDoor, description } =
      options

    this.id = id
    this._isGround = isGround
    this._isWalkable = isWalkable
    this._isWall = isWall || false
    this.actionId = actionId
    this.facing = facing
    this.equipment = equipment
    this.nextItemId = nextItemId
    this.description = description
    this._isDoor = isDoor || false
  }

  getId(): string {
    return this.id
  }

  setId(id: string) {
    this.id = id
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

  getDescription(): string | undefined {
    return this.description
  }

  isDoor() {
    return this._isDoor
  }

  toData() {
    return {
      id: this.id,
      isGround: this._isGround,
      isWalkable: this._isWalkable,
      isWall: this._isWall,
      actionId: this.actionId,
      facing: this.facing,
      equipment: this.equipment?.toData(),
      equipmentId: this.equipment?.getId(),
      nextItemId: this.nextItemId,
      description: this.description,
      isDoor: this._isDoor
    }
  }
}

export { ItemType }
