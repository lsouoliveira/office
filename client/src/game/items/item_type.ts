interface ItemTypeOptions {
  isGround: boolean
  isWalkable: boolean
  isWall?: boolean
  actionId?: string
  facing?: string
  isDoor?: boolean
}

class ItemType {
  private id: string
  private _isGround: boolean
  private _isWalkable: boolean
  private _isWall: boolean
  private _actionId?: string
  private _facing?: string
  private _isDoor: boolean

  constructor(id: string, options: ItemTypeOptions) {
    const { isGround, isWalkable, actionId, facing, isWall, isDoor } = options

    this.id = id
    this._isGround = isGround
    this._isWalkable = isWalkable
    this._isWall = isWall || false
    this._actionId = actionId
    this._facing = facing
    this._isDoor = isDoor || false
  }

  getId(): string {
    return this.id
  }

  isGround(): boolean {
    return this._isGround
  }

  isWall(): boolean {
    return this._isWall
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

  isDoor(): boolean {
    return this._isDoor
  }
}

export { ItemType }
