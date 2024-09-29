interface ItemTypeOptions {
  isGround: boolean
  isWalkable: boolean
  actionId?: string
  facing?: string
}

class ItemType {
  private id: string
  private _isGround: boolean
  private _isWalkable: boolean
  private _actionId?: string
  private _facing?: string

  constructor(id: string, options: ItemTypeOptions) {
    const { isGround, isWalkable, actionId, facing } = options

    this.id = id
    this._isGround = isGround
    this._isWalkable = isWalkable
    this._actionId = actionId
    this._facing = facing
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

  getActionId(): string | undefined {
    return this._actionId
  }

  getFacing(): string | undefined {
    return this._facing
  }
}

export { ItemType }
