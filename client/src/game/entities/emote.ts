import * as PIXI from 'pixi.js'
import { type Entity } from './entity'

const DEFAULT_DURATION = 2.5

const EMOTE_INDEX = {
  '1': [0, 8],
  '2': [0, 10],
  '3': [0, 11],
  '4': [0, 6],
  '5': [0, 7],
  '6': [1, 4],
  '7': [1, 5],
  '8': [1, 6],
  '9': [1, 7],
  '0': [1, 15],
  '-': [1, 16],
  '=': [1, 12]
} as Record<string, [number, number]>

class Emote extends PIXI.Sprite implements Entity {
  private duration: number
  private timer: number
  private id: string

  constructor(id: string, texture: PIXI.Texture, duration: number) {
    super(texture)

    this.duration = duration
    this.timer = 0
    this.id = id
  }

  updateEntity(dt: number) {
    this.timer += dt

    if (this.timer >= this.duration) {
      this.destroy()
    }
  }

  getID() {
    return this.id
  }

  static create(id: string, spritesheet: PIXI.Texture, duration = DEFAULT_DURATION) {
    if (!EMOTE_INDEX[id]) {
      return
    }

    const x = EMOTE_INDEX[id][1]
    const y = EMOTE_INDEX[id][0]

    const textureRect = new PIXI.Rectangle(x * 16, y * 32, 16, 32)
    const texture = new PIXI.Texture({ source: spritesheet.source, frame: textureRect })

    return new Emote(id, texture, duration)
  }

  destroy() {
    this.emit('destroy')
    super.destroy()
  }
}

export { Emote }
