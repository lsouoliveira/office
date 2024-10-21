interface ItemTypeOptions {
  isGround: boolean
  isWalkable: boolean
  isWall?: boolean
  actionId?: string
  facing?: string
  equipmentId?: string
}

class ItemType {
  private id: string
  private _isGround: boolean
  private _isWalkable: boolean
  private _isWall: boolean
  private actionId?: string
  private facing?: string
  private equipmentId?: string

  constructor(id: string, options: ItemTypeOptions) {
    const { isGround, isWalkable, actionId, facing, equipmentId, isWall } = options

    this.id = id
    this._isGround = isGround
    this._isWalkable = isWalkable
    this._isWall = isWall || false
    this.actionId = actionId
    this.facing = facing
    this.equipmentId = equipmentId
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
    return this.equipmentId
  }

  toData() {
    return {
      id: this.id,
      isGround: this._isGround,
      isWalkable: this._isWalkable,
      isWall: this._isWall,
      actionId: this.actionId,
      facing: this.facing,
      equipmentId: this.equipmentId
    }
  }
}

export { ItemType }
