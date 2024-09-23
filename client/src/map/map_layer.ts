import { Container } from 'pixi.js'
import { Tile } from './tiles/tile'

class MapLayer extends Container {
    public readonly width: number
    public readonly height: number

    private tiles: Tile[]

    constructor(width: number, height: number, tiles: Tile[]) {
        super()

        this.width = width
        this.height = height
        this.tiles = tiles

        for (let i = 0; i < this.tiles.length; i++) {
            if (!this.tiles[i]) {
                continue
            }

            this.addChild(this.tiles[i])
        }
    }

    update(dt: number) {
        for (let i = 0; i < this.tiles.length; i++) {
            this.tiles[i].update(dt)
        }
    }

    getTile(x: number, y: number): Tile {
        return this.tiles[y * this.width + x]
    }

    setTile(x: number, y: number, tile: Tile) {
        this.tiles[y * this.width + x] = tile
    }
}

export {
    MapLayer
}
