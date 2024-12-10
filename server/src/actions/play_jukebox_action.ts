import { ActionHandler } from './action_handler'

const JUKEBOX_PRICE = 25
const MAX_MUSIC_SHEET_LENGTH = 2000

class PlayJukeboxAction extends ActionHandler {
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
      let musicSheet = this.data.musicSheet

      if (musicSheet > MAX_MUSIC_SHEET_LENGTH) {
        musicSheet = musicSheet.data.musicSheet.substr(0, MAX_MUSIC_SHEET_LENGTH)
      }

      if (player.getMoney() < JUKEBOX_PRICE) {
        return {
          status: 400,
          body: {
            error: 'insufficient_funds'
          }
        }
      }

      player.addMoney(-JUKEBOX_PRICE)
      this.world.playJukebox(player.getId(), musicSheet)

      return {
        status: 200,
        body: {}
      }
    }
  }
}

export { PlayJukeboxAction }
