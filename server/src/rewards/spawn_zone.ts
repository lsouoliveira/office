class SpawnZone {
  private x: number
  private y: number
  private width: number
  private height: number

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
  }

  get X() {
    return this.x
  }

  get Y() {
    return this.y
  }

  get Width() {
    return this.width
  }

  get Height() {
    return this.height
  }
}

export default SpawnZone
