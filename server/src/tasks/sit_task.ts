import { Task } from './task'
import { Player } from './../player'
import { Item } from './../items/item'
import { Tile } from './../tiles/tile'

class SitTask extends Task {
  private player: Player
  private item: any
  private tile
  private socket: any

  constructor(player: Player, item: Item, tile: Tile, socket: any) {
    super()

    this.player = player
    this.item = item
    this.tile = tile
    this.socket = socket
  }

  _perform() {
    if (!this.player.movement.isMoving()) {
      if (!this.player.sit(this.item)) {
        this.markAsDone()

        return
      }

      this.socket.emit('player:sit', {
        playerId: this.player.playerData.id,
        itemId: this.item.getId(),
        tile: this.tile.toData()
      })

      this.markAsDone()
    }
  }
}

export { SitTask }
