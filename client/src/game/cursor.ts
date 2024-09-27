import { Container, Graphics } from 'pixi.js'
import { GameMap } from './map/game_map'
import { TILE_SIZE } from './map/tile'

class CursorRenderer extends Graphics {
  constructor(width: number, height: number) {
    super()

    this.rect(0, 0, width, height)
  }
}

class Cursor extends Container {
  private renderer: CursorRenderer
  private map: GameMap
  private isHidden: boolean

  constructor(width: number, height: number, map: GameMap) {
    super()

    this.renderer = new CursorRenderer(width, height)
    this.map = map
    this.isHidden = false

    this.addChild(this.renderer)
  }

  moveTo(x: number, y: number) {
    if (this.isHidden) {
      return
    }

    const tileX = Math.floor(x / TILE_SIZE)
    const tileY = Math.floor(y / TILE_SIZE)

    if (!this.map.contains(tileX, tileY)) {
      this.visible = false

      return
    }

    const tile = this.map.getTile(tileX, tileY)

    if (tile.isEmpty()) {
      this.visible = false

      return
    }

    this.visible = true
    this.position.set(tileX * TILE_SIZE, tileY * TILE_SIZE)

    if (!tile.isWalkable()) {
      this.renderer
        .clear()
        .beginFill(0xff0000, 0.5)
        .setStrokeStyle({ width: 1, color: 0x000000 })
        .rect(0, 0, TILE_SIZE, TILE_SIZE)
        .endFill()
    } else {
      this.renderer
        .clear()
        .beginFill(0x00ff00, 0.5)
        .setStrokeStyle({ width: 1, color: 0x000000 })
        .rect(0, 0, TILE_SIZE, TILE_SIZE)
        .endFill()
    }
  }

  hide() {
    this.visible = false
    this.isHidden = true
  }

  show() {
    this.visible = true
    this.isHidden = false
  }
}

export { Cursor }
