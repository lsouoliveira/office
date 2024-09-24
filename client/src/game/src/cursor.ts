import { Graphics, InteractionManager } from 'pixi.js';
import { Map } from './map/map';

class Cursor extends Graphics {
    private map: Map

    constructor(width: number, height: number, borderColor: number, map: Map) {
        super()

        this.map = map

        this.rect(0, 0, width, height)
            .setStrokeStyle({ color: borderColor, width: 1 })
            .stroke()
    }

    update() {
    }

    moveTo(x: number, y: number) {
        const tileX = Math.floor(x / this.map.tileSize)
        const tileY = Math.floor(y / this.map.tileSize)

        if (!this.map.contains(tileX, tileY)) {
            this.visible = false

            return
        }

        this.visible = true
        this.position.set(tileX * this.map.tileSize, tileY * this.map.tileSize)

        if (this.map.checkCollision(tileX, tileY)) {
            this.clear()
                .beginFill(0xff0000, 0.5)
                .rect(0, 0, this.map.tileSize, this.map.tileSize)
                .endFill()
        } else {
            this.clear()
                .beginFill(0x00ff00, 0.5)
                .rect(0, 0, this.map.tileSize, this.map.tileSize)
                .endFill()
        }
    }
}

export {
    Cursor
}

