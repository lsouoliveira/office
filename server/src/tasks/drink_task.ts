import { Task } from './task'
import { Player } from './../player'

class DrinkTask extends Task {
  private player: Player

  constructor(player: Player) {
    super()

    this.player = player
  }

  _perform() {
    this.player.drink()
  }
}

export { DrinkTask }
