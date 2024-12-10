import { Task } from './task'

class JukeboxTask extends Task {
  socket: any

  constructor(socket: any) {
    super()

    this.socket = socket
  }

  _perform() {
    this.socket.emit('jukebox:open')
    this.markAsDone()
  }
}

export { JukeboxTask }
