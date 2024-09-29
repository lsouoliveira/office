import { Task } from './task'
import { Player } from './../player'
import { Item } from './../items/item'
import { Tile } from './../tiles/tile'

class ComputerTask extends Task {
  constructor(socket: any) {
    super()

    this.socket = socket
  }

  _perform() {
    this.socket.emit('computer:open')

    this.markAsDone()
  }
}

export { ComputerTask }
