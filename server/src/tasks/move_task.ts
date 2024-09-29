import { Task } from './task'
import { Player } from './../player'

class MoveTask extends Task {
  private player: Player
  private target: Number[]
  private isMoving: boolean = false

  constructor(player: Player, target: Number[]) {
    super()

    this.player = player
    this.target = target
  }

  _perform() {
    if (!this.isMoving) {
      this.isMoving = true

      this.player.movement.moveTo(this.target[0], this.target[1])
    } else if (
      this.player.movement.gridX() === this.target[0] &&
      this.player.movement.gridY() === this.target[1] &&
      !this.player.movement.isMoving()
    ) {
      this.markAsDone()
    }
  }
}

export { MoveTask }
