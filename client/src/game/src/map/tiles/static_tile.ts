import { Texture } from 'pixi.js';
import { Tile, TileType } from './tile';

class StaticTile extends Tile {
  constructor(texture: Texture) {
    super(TileType.STATIC, texture)
  }
}

export {
  StaticTile
}
