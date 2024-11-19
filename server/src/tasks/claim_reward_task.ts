import { Task } from './task'
import { Player } from './../player'
import { Item } from './../items/item'
import { Tile } from './../tiles/tile'
import { World } from './../world'
import logger from './../logger'

class ClaimRewardTask extends Task {
  private world: World
  private player: Player
  private itemId: string

  constructor(world: World, player: Player, itemId: string) {
    super()

    this.world = world
    this.player = player
    this.itemId = itemId
  }

  _perform() {
    try {
      this.world.getRewardSpawnerSystem().claimReward(this.player.getId(), this.itemId)
    } catch (error) {
      logger.error(`Error claiming reward: ${error}`)
    } finally {
      this.markAsDone()
    }
  }
}

export { ClaimRewardTask }
