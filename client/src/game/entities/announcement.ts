import { Text, Container } from 'pixi.js'
import { type Entity } from './entity'

const DEFAULT_DURATION = 5

enum Level {
  INFO,
  WARNING,
  DANGER
}

const LEVEL_TO_COLOR = {
  0: 0x00ff00,
  1: 0xff0000,
  2: 0xffff00
}

class Announcement extends Container implements Entity {
  private timer: number = 0
  private text: Text

  constructor() {
    super()

    this.text = new Text('', {
      fill: 'black',
      fontFamily: 'Arial',
      fontSize: 32,
      stroke: 0x000000,
      strokeThickness: 4
    })

    this.timer = 0

    this.addChild(this.text)
    this.text.visible = false
  }

  updateEntity(dt: number) {
    if (this.timer > 0) {
      this.timer -= dt

      if (this.timer <= 0) {
        this.text.visible = false
      }
    }
  }

  show(text: string, level: Level = Level.INFO, duration: number = DEFAULT_DURATION) {
    this.text.text = text
    this.text.style.fill = LEVEL_TO_COLOR[level]
    this.text.visible = true
    this.timer = duration
  }

  destroy() {
    this.emit('destroy')
    super.destroy()
  }
}

export { Announcement }
