import Ability from '../ability'
import { Player } from '../../player'
import { World } from '../../world'
import { ItemType } from '../../items/item_type'
import { Item } from '../../items/item'
import { Tile } from '../../map/tile'
import { TILE_SIZE } from '../../config'

class UnlockDoorAbility implements Ability {
  private world: World

  constructor(world: World) {
    this.world = world
  }

  cast(caster: Player) {
    if (!this.world.getMap().contains(caster.movement.gridX(), caster.movement.gridY())) {
      return
    }

    const doorTiles = this.getDoorTiles(caster.movement.gridX(), caster.movement.gridY())

    if (doorTiles.length === 0) {
      return
    }

    doorTiles.forEach((tile) => {
      tile.getItems().forEach((item) => {
        this.openDoor(tile, item)
      })
    })
  }

  private getDoorTiles(x: number, y: number) {
    const tiles: Tile[] = []

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const tile = this.world.getMap().getTile(x - 1 + i, y - 1 + j)

        tile.getItems().forEach((item) => {
          if (item?.isDoor()) {
            tiles.push(tile)
          }
        })
      }
    }

    return tiles
  }

  private openDoor(tile: Tile, oldItem: Item) {
    if (!oldItem || oldItem.isWalkable()) {
      return
    }

    const nextItemId = oldItem.getType().getNextItemId()

    if (!nextItemId) {
      return
    }

    const equipment = this.world.createEquipment(oldItem.getType().getEquipmentId())
    const itemData = this.world.getItemById(nextItemId)
    const itemType = new ItemType(
      nextItemId,
      {
        isGround: itemData.is_ground,
        isWalkable: itemData.is_walkable,
        isWall: itemData.is_wall,
        actionId: itemData.action_id,
        facing: itemData.facing,
        nextItemId: itemData.next_item_id,
        isDoor: itemData.is_door
      },
      equipment
    )

    console.log('itemType', itemType)

    const newItem = new Item(itemType)

    this.world.sendMessage('item:replaced', {
      tile: tile.toData(),
      item: oldItem.toData(),
      newItem: newItem.toData()
    })

    tile.replaceItem(oldItem, newItem)

    this.world.sendMessage('explosion:added', {
      position: {
        x: tile.getX() * TILE_SIZE + TILE_SIZE / 2,
        y: tile.getY() * TILE_SIZE + TILE_SIZE / 2
      },
      type: 'blue_2'
    })
  }
}

export default UnlockDoorAbility
