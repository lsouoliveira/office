import { World } from '../world'

class ActionHandler {
  private _world: World
  private _socket: any
  private _data: any

  constructor(world: World, socket: any, data: any) {
    this._world = world
    this._socket = socket
    this._data = data
  }

  get world() {
    return this._world
  }

  get socket() {
    return this._socket
  }

  get data() {
    return this._data
  }

  async handle() {
    throw Error('Not implemented')
  }
}

export { ActionHandler }
