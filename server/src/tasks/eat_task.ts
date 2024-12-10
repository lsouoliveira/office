import { Task } from './task'
import { Player } from './../player'

class EatTask extends Task {
  private player: Player

  constructor(player: Player) {
    super()

    this.player = player
  }

  _perform() {
    this.player.eat()
    this.player.addMoney(-10)
    this.markAsDone()
  }
}

export { EatTask }
