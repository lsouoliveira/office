import { Task } from './task'
import { Player } from './../player'
import { Item } from './../items/item'
import { Tile } from './../tiles/tile'

class SitTask extends Task {
  private player: Player
  private item: Item
  private tile: Tile

  constructor(player: Player, item: Item, tile: Tile) {
    super()

    this.player = player
    this.item = item
    this.tile = tile
  }

  _perform() {
    if (!this.player.movement.isMoving()) {
      this.player.sit(this.tile, this.item)

      this.markAsDone()
    }
  }
}

export { SitTask }
