import { ActionHandler } from './action_handler'
import { Item } from '../items/item'
import { ItemType } from '../items/item_type'
import shopJson from '../../data/shop.json'

class GetNextLotteryAction extends ActionHandler {
  async handle() {
    const player = this.world.getPlayerBySessionId(this.socket.sessionId)

    if (!player) {
      return {
        status: 404,
        body: {
          message: 'Player not found'
        }
      }
    } else {
      const prizePool = this.world.getLotterySystem().getPrizePool()

      return {
        status: 200,
        body: {
          prize: prizePool
        }
      }
    }
  }
}

export { GetNextLotteryAction }
