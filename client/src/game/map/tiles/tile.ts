import { Sprite, Texture } from "pixi.js";

enum TileType {
    STATIC
}

class Tile extends Sprite {
    public readonly type: TileType;

    constructor(type: TileType, texture: Texture) {
        super(texture);

        this.type = type;
    }

    update(_: number) {}
}

export {
    Tile,
    TileType
}
