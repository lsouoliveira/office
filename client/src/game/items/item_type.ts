interface ItemTypeOptions {
  isGround: boolean
  isWalkable: boolean
}

class ItemType {
  private id: string
  private _isGround: boolean
  private _isWalkable: boolean

  constructor(id: string, options: ItemTypeOptions) {
    const { isGround, isWalkable } = options

    this.id = id
    this._isGround = isGround
    this._isWalkable = isWalkable
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
}

export { ItemType }
