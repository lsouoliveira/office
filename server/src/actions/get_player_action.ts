import { ActionHandler } from './action_handler'

class GetPlayerAction extends ActionHandler {
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
      return {
        status: 200,
        body: {
          player: player.getPlayerData()
        }
      }
    }
  }
}

export { GetPlayerAction }
