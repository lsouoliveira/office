import { ActionHandler } from './action_handler'
import { Item } from '../items/item'
import { ItemType } from '../items/item_type'
import shopJson from '../../data/shop.json'

class GetLastLotteryResultsAction extends ActionHandler {
  async handle() {
    const lastResults = await this.world.getLotterySystem().getLastNthResults(5)

    return {
      status: 200,
      body: {
        data: lastResults
      }
    }
  }
}

export { GetLastLotteryResultsAction }
