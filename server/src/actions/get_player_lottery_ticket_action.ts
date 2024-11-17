import { ActionHandler } from './action_handler'
import { Item } from '../items/item'
import { ItemType } from '../items/item_type'
import shopJson from '../../data/shop.json'

class GetPlayerLotteryTicketAction extends ActionHandler {
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
      const playerTicket = this.world.getLotterySystem().getPlayerTicketByPlayerId(player.getId())

      if (!playerTicket) {
        return {
          status: 404,
          body: {
            message: 'Player ticket not found'
          }
        }
      }

      return {
        status: 200,
        body: {
          number: playerTicket.getNumber()
        }
      }
    }
  }
}

export { GetPlayerLotteryTicketAction }
