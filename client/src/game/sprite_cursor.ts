import * as PIXI from 'pixi.js'
import spritesData from './data/sprites.json'
import { TILE_SIZE } from './map/tile'
import { GameMap } from './map/game_map'

interface ItemData {
  ids: string[]
  x: number
  y: number
}

class SpriteCursor extends PIXI.Container {
  private origin: { x: number; y: number } = { x: 0, y: 0 }
  private itemDatas: (ItemData | undefined)[][] = []
  private map: GameMap
  private preview: PIXI.Graphics

  constructor(map: GameMap) {
    super()

    this.map = map
    this.visible = false
    this.preview = new PIXI.Graphics().rect(0, 0, TILE_SIZE, TILE_SIZE)
    this.preview.zIndex = 1
    this.preview.position.set(0, 0)
    this.sortableChildren = true

    this.addChild(this.preview)
  }

  setBrushFromMapPosition(tileX: number, tileY: number, width: number, height: number) {
    this.resizePreview(width, height)
    this.reset()

    for (let i = 0; i < height; i++) {
      this.itemDatas.push([])

      for (let j = 0; j < height; j++) {
        const x = tileX + j
        const y = tileY + i
        const itemData = this.getItemDataByTilePosition(x, y)

        if (itemData) {
          const sprite = this.createSprite(itemData.ids[itemData.ids.length - 1])
          sprite.position.set(j * TILE_SIZE, i * TILE_SIZE)
          sprite.zIndex = 0

          this.addChild(sprite)
        }

        this.itemDatas[i].push(itemData)
      }
    }

    this.visible = true
  }

  setBrush(spriteId: string) {
    this.resizePreview(1, 1)
    this.reset()

    const sprite = this.createSprite(spriteId)
    sprite.position.set(0, 0)
    sprite.zIndex = 0

    this.itemDatas = [[{ ids: [spriteId], x: 0, y: 0 }]]

    this.addChild(sprite)

    this.visible = true
  }

  resizePreview(width: number, height: number) {
    this.preview
      .clear()
      .beginFill(0xffff00, 0.5)
      .setStrokeStyle({ width: 1, color: 0x000000 })
      .rect(0, 0, width * TILE_SIZE, height * TILE_SIZE)
      .endFill()
    this.preview.zIndex = 1
  }

  getItemDatas() {
    return [...this.itemDatas]
  }

  clear() {
    this.visible = false
    this.reset()
  }

  isActive() {
    return this.visible && this.itemDatas.length
  }

  getBrushWidth() {
    if (!this.itemDatas.length) {
      return 0
    }

    return this.itemDatas[0].length
  }

  getBrushHeight() {
    if (!this.itemDatas.length) {
      return 0
    }

    return this.itemDatas.length
  }

  moveTo(x: number, y: number) {
    if (!this.isActive()) {
      return
    }

    const tileX = Math.floor(x / TILE_SIZE)
    const tileY = Math.floor(y / TILE_SIZE)

    this.visible = true
    this.position.set(tileX * TILE_SIZE, tileY * TILE_SIZE)
  }

  private getItemDataByTilePosition(x: number, y: number): ItemData | undefined {
    if (!this.map.contains(x, y)) {
      return undefined
    }

    const tile = this.map.getTile(x, y)

    if (!tile.getItems().length) {
      return undefined
    }

    return {
      ids: tile.getItems().map((item) => item.getItemTypeId()),
      x,
      y
    }
  }

  private reset() {
    this.itemDatas = []
    this.removeChildren()
    this.addChild(this.preview)
  }

  private createSprite(spriteId: string) {
    let spriteData

    if (spriteId in spritesData) {
      spriteData = spritesData[spriteId]
    } else {
      spriteData = spritesData['default']
    }

    const tilesetTexture = PIXI.Assets.get(spriteData.tileset)
    const pivot = spriteData.pivot || { x: 0, y: 0 }

    const tileId = spriteData.states[0]
    const tileSize = spriteData.tileSize || TILE_SIZE
    const tilesWidth = tilesetTexture.width / tileSize

    const tilesetX = tileId % tilesWidth
    const tilesetY = Math.floor(tileId / tilesWidth)

    const textureRect = new PIXI.Rectangle(
      tilesetX * tileSize,
      tilesetY * tileSize,
      spriteData.width * tileSize,
      spriteData.height * tileSize
    )
    const texture = new PIXI.Texture({ source: tilesetTexture.source, frame: textureRect })

    const sprite = new PIXI.Sprite(texture)
    sprite.texture = texture
    sprite.width = spriteData.width * tileSize
    sprite.height = spriteData.height * tileSize

    return sprite
  }
}

export { SpriteCursor }
