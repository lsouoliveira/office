import { Tile } from './tile'

class GameMap {
  private width: number
  private height: number
  private tiles: Tile[][]

  constructor(width: number, height: number) {
    this.width = width
    this.height = height
    this.tiles = []
  }

  init() {
    for (let y = 0; y < this.height; y++) {
      const row = []

      for (let x = 0; x < this.width; x++) {
        row.push(new Tile(x, y))
      }

      this.tiles.push(row)
    }
  }

  getTile(x: number, y: number): Tile {
    return this.tiles[y][x]
  }

  contains(x: number, y: number): boolean {
    return x >= 0 && x < this.width && y >= 0 && y < this.height
  }

  toData() {
    return {
      width: this.width,
      height: this.height,
      tiles: this.tiles.map((row) => row.map((tile) => tile.toData()))
    }
  }
}

export { GameMap }
