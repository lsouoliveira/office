interface ItemTypeOptions {
  isGround: boolean
  isWalkable: boolean
  actionId?: string
}

class ItemType {
  private id: string
  private _isGround: boolean
  private _isWalkable: boolean
  private actionId?: string

  constructor(id: string, options: ItemTypeOptions) {
    const { isGround, isWalkable, actionId } = options

    this.id = id
    this._isGround = isGround
    this._isWalkable = isWalkable
    this.actionId = actionId
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
    return this.actionId
  }

  toData() {
    return {
      id: this.id,
      isGround: this._isGround,
      isWalkable: this._isWalkable
    }
  }
}

export { ItemType }
