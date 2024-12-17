import { Task } from './task'
import { Player } from './../player'
import { Item } from './../items/item'
import { Tile } from '../map/tile'
import logger from '../logger'

class DriveTask extends Task {
  private socket: any
  private player: Player
  private tile: Tile
  private item: Item

  constructor(socket: any, player: Player, tile: Tile, item: Item) {
    super()

    this.socket = socket
    this.player = player
    this.tile = tile
    this.item = item
  }

  _perform() {
    try {
      this.tile.removeItem(this.item)
      this.player.equip(this.item)
      this.player.getInventory().addItem(this.item)
      this.socket.emit('item:removed', {
        id: this.item.getId(),
        x: this.tile.getX(),
        y: this.tile.getY()
      })
    } catch (e) {
      logger.error(
        `[ DriveTask ] Failed to remove item from tile { x = ${this.tile.getX()}, y = ${this.tile.getY()} }`
      )
    }

    this.markAsDone()
  }
}

export { DriveTask }
