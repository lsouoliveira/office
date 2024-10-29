import { io, Socket } from 'socket.io-client'
import { EventEmitter } from '../os/event_emitter'

class TennisClient extends EventEmitter {
  private host: string
  private userId?: string
  private username?: string
  private io?: Socket

  constructor(host: string, { userId, username }: { userId?: string; username?: string }) {
    super()

    this.host = host
    this.userId = userId
    this.username = username
  }

  connect() {
    this.io = io(this.host, { transports: ['websocket'] })
    this.io.auth = {
      userId: this.userId,
      username: this.username
    }

    this.io.on('connect', () => {
      this.emit('connect')

      const events = [
        'session',
        'room',
        'game:state',
        'game:hit',
        'game:nextTurn',
        'user:connected',
        'user:disconnected',
        'user:message'
      ]

      events.forEach((event) => {
        this.io?.on(event, (data: any) => {
          this.emit(event, data)
        })
      })
    })
  }

  joinGame() {
    this.io?.emit('game:join')
  }

  movePad(userId: string, x: number) {
    this.io?.emit('game:move', { userId, x })
  }

  rematch() {
    this.io?.emit('game:rematch')
  }

  sendMessage(message: string) {
    this.io?.emit('user:message', { message })
  }

  disconnect() {
    this.io?.disconnect()
  }
}

export { TennisClient }
