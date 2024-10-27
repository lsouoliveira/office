import { Task } from './task'

class PingPongTask extends Task {
  private socket: any

  constructor(socket: any) {
    super()

    this.socket = socket
  }

  _perform() {
    this.socket.emit('ping_pong:open')

    this.markAsDone()
  }
}

export { PingPongTask }
