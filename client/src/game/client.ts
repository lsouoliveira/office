import { io, Socket } from 'socket.io-client'

const ACTION_DEFAULT_TIMEOUT = 5000

class ActionResponseError extends Error {
  public readonly status: number
  public readonly response: any

  constructor(status: number, response: any) {
    super(`Action response error: ${status}`)

    this.status = status
    this.response = response
  }
}

class Client {
  public socket: Socket
  private callbacks: any = {}
  private timeouts: any = {}

  constructor(url: string, credentials: any) {
    this.socket = io(url, { transports: ['websocket'] })
    this.socket.auth = {
      sessionId: credentials.sessionId,
      token: credentials.token
    }

    this.socket.on('actionResponse', (data: any) => {
      const { requestId, response } = data
      const callback = this.callbacks[requestId]

      callback(response)
    })
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

  playEmote(emoteId: string) {
    this.socket.emit('player:playEmote', emoteId)
  }

  helloWorld() {
    return this.sendAction('helloWorld', {})
  }

  getPlayerInventory() {
    return this.sendAction('getPlayerInventory', {})
  }

  getPlayer() {
    return this.sendAction('getPlayer', {})
  }

  equipItem(itemId: string) {
    return this.sendAction('equipItem', { itemId })
  }

  unequipItem(itemId: string) {
    return this.sendAction('unequipItem', { itemId })
  }

  getShop() {
    return this.sendAction('getShop', {})
  }

  buyItem(itemTypeId: string) {
    return this.sendAction('buyItem', { itemTypeId })
  }

  private sendAction(action: string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const requestId = Math.random().toString(36).substring(7)

      this.timeouts[requestId] = setTimeout(() => {
        if (this.callbacks[requestId]) {
          reject(new ActionResponseError(504, 'Timeout'))
          delete this.callbacks[requestId]
        }
      }, ACTION_DEFAULT_TIMEOUT)

      this.callbacks[requestId] = (response: any) => {
        if (this.callbacks[requestId]) {
          delete this.callbacks[requestId]
        }

        if (this.timeouts[requestId]) {
          clearTimeout(this.timeouts[requestId])
          delete this.timeouts[requestId]
        }

        if (response.status === 200) {
          resolve(response)
        } else {
          reject(new ActionResponseError(response.status, response))
        }
      }

      this.socket.emit('actionCall', { requestId, action, data })
    })
  }
}

export { Client }
