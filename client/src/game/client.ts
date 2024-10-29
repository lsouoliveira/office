import { io, Socket } from 'socket.io-client'

class Client {
  public socket: Socket

  constructor(url: string, credentials: any) {
    this.socket = io(url, { transports: ['websocket'] })
    this.socket.auth = {
      username: credentials.username,
      sessionId: credentials.sessionId
    }
  }

  moveTo(x: number, y: number) {
    this.socket.emit('player:move', { x, y })
  }

  sendMessage(message: string) {
    this.socket.emit('player:message', message)
  }

  placeItem(x: number, y: number, itemId: string) {
    this.socket.emit('player:placeItem', { x, y, itemId })
  }

  removeItem(x: number, y: number) {
    this.socket.emit('player:removeItem', { x, y })
  }

  changeName(name: string) {
    this.socket.emit('player:changeName', name)
  }

  changeSkin(skin: string) {
    this.socket.emit('player:changeSkin', skin)
  }

  use(x: number, y: number) {
    this.socket.emit('player:use', { x, y })
  }

  playNote(note: string) {
    this.socket.emit('player:playNote', note)
  }

  releaseNote(note: string) {
    this.socket.emit('player:releaseNote', note)
  }
}

export { Client }
