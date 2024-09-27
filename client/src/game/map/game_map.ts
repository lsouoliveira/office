import * as PIXI from 'pixi.js'
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

  getWidth(): number {
    return this.width
  }

  getHeight(): number {
    return this.height
  }

  setTile(x: number, y: number, tile: Tile): void {
    this.tiles[y][x] = tile
  }

  render(stage: PIXI.Container, x: number, y: number): void {
    this.tiles.forEach((row) => {
      row.forEach((tile) => {
        tile.render(stage, x, y)
      })
    })
  }
}

export { GameMap }
