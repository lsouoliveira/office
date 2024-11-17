import { ActionHandler } from './action_handler'
import shopJson from '../../data/shop.json'

class GetShopAction extends ActionHandler {
  async handle() {
    return {
      status: 200,
      body: shopJson
    }
  }
}

export { GetShopAction }
