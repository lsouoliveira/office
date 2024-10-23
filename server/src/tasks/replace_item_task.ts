import { Task } from './task'
import { Player } from './../player'
import { Item } from './../items/item'
import { Tile } from './../map/tile'

class ReplaceItemTask extends Task {
  private socket: any
  private player: Player
  private item: Item
  private tile: Tile
  private newItem: Item

  constructor(socket: any, player: Player, item: Item, tile: Tile, newItem: Item) {
    super()

    this.socket = socket
    this.player = player
    this.item = item
    this.tile = tile
    this.newItem = newItem
  }

  _perform() {
    this.tile.replaceItem(this.item, this.newItem)

    this.socket.emit('item:replaced', {
      tile: this.tile.toData(),
      item: this.item.toData(),
      newItem: this.newItem.toData()
    })

    this.markAsDone()
  }
}

export { ReplaceItemTask }
