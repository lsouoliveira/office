import { Container, Point } from 'pixi.js'
import { MapLayer } from './map_layer'

class Level extends Container {
    private layers: MapLayer[]
    private collisionMap: boolean[][]
    private tilesWidth: number
    private tilesHeight: number
    public readonly tileSize: number

    constructor(tilesWidth: number, tilesHeight: number, tileSize: number, layers: MapLayer[], collisionMap: boolean[][]) {
        super()

        this.tilesWidth = tilesWidth
        this.tilesHeight = tilesHeight
        this.tileSize = tileSize
        this.layers = layers
        this.collisionMap = collisionMap

        for (let i = 0; i < this.layers.length; i++) {
            this.addChild(this.layers[i])
        }
    }

    checkCollision(x: number, y: number): boolean {
        return this.collisionMap[y][x]
    }

    update(dt: number) {
        for (let i = 0; i < this.layers.length; i++) {
            this.layers[i].update(dt)
        }
    }

    getLayer(index: number): MapLayer {
        return this.layers[index]
    }

    getWidth(): number {
        return this.tilesWidth * this.tileSize
    }

    getHeight(): number {
        return this.tilesHeight * this.tileSize
    }

    getCenter(): Point {
        return new Point(this.x + this.getWidth() / 2, this.y + this.getHeight() / 2)
    }

    contains(x: number, y: number): boolean {
        return x >= 0 && x < this.tilesWidth && y >= 0 && y < this.tilesHeight
    }
}

export {
    Level
}
