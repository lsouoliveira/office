import { Assets, Texture, Rectangle, Sprite } from 'pixi.js'
import { Level } from './map'
import { MapLayer } from './map_layer'
import { Tile, StaticTile } from './tiles/static_tile'

class MapLoader {
    static fromObject(object: any): Level  {
        const mapWidth = object.width
        const mapHeight = object.height

        const collisionLayer = object.layers.find((layer: any) => layer.name === 'collision')
        const collisionMap = MapLoader.createCollisionMap(collisionLayer)

        const layers = object.layers
            .filter((layer: any) => layer.name !== 'collision')
            .map((layer: any) => MapLoader.createLayer(layer, object.tilesets))

        const tileSize = object.tilewidth

        return new Level (mapWidth, mapHeight, tileSize, layers, collisionMap)
    }

    static createCollisionMap(layer: any): boolean[][] {
        const collisionMap = []

        if (!layer) {
            return collisionMap
        }

        for (let y = 0; y < layer.height; y++) {
            collisionMap[y] = []

            for (let x = 0; x < layer.width; x++) {
                collisionMap[y][x] = layer.data[y * layer.width + x] !== 0
            }
        }

        return collisionMap
    }

    static createLayer(layer: any, tilesets: any[] = []): any {
        const tiles = []

        for (let y = 0; y < layer.height; y++) {
            for (let x = 0; x < layer.width; x++) {
                const tileIndex = layer.data[y * layer.width + x]

                if (tileIndex === 0) {
                    continue
                }

                const tile = MapLoader.createTile(tileIndex, tilesets)
                tiles[y * layer.width + x] = tile
                tile.position.set(x * tile.width, y * tile.height)
            }
        }

        return new MapLayer(layer.width, layer.height, tiles)
    }

    static createTile(tileIndex: number, tilesets: any[]): Tile {
        for (let i = tilesets.length - 1; i >= 0; i--) {
            const tileset = tilesets[i]
            const firstGid = tileset.firstgid

            if (tileIndex >= firstGid) {
                const localTileId = tileIndex - firstGid
                const spritesheetData = Assets.get(tileset.source)

                const x = localTileId % spritesheetData.columns
                const y = Math.floor(localTileId / spritesheetData.columns)

                const tilesetTexture = Assets.get(spritesheetData.image)
                const frame = new Rectangle(x * spritesheetData.tilewidth, y * spritesheetData.tileheight, spritesheetData.tilewidth, spritesheetData.tileheight)
                const tileTexture = new Texture({ 
                    source: tilesetTexture.source,
                    frame: frame
                })

                const tile = new StaticTile(tileTexture)

                tile.width = spritesheetData.tilewidth
                tile.height = spritesheetData.tileheight

                return tile
            }
        }

        throw new Error(`Tile with index ${tileIndex} not found in any tileset`)
    }
}

export {
    MapLoader
}
