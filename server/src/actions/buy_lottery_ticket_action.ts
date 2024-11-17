import { ActionHandler } from './action_handler'
import { Item } from '../items/item'
import { ItemType } from '../items/item_type'
import shopJson from '../../data/shop.json'

class BuyLotteryTicketAction extends ActionHandler {
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
      const result = this.world.getLotterySystem().buyTicket(player, this.data.number)

      if (result.isFail()) {
        return {
          status: 400,
          body: {
            error: result.getError()
          }
        }
      }

      return {
        status: 200,
        body: {}
      }
    }
  }
}

export { BuyLotteryTicketAction }
