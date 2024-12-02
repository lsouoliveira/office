import { Text, Container } from 'pixi.js'
import { type Entity } from './entity'

const DEFAULT_DURATION = 5

class Inspect extends Container implements Entity {
  private timer: number = 0
  private text: Text

  constructor() {
    super()

    this.text = new Text('', {
      fill: 0x00ff00,
      fontFamily: 'Arial',
      fontSize: 22,
      stroke: 0x000000,
      strokeThickness: 4,
      wordWrap: true,
      wordWrapWidth: window.innerWidth * 0.6,
      align: 'center'
    })
    this.text.anchor.set(0.5, 0)

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

  fixedUpdateEntity() {}

  show(text: string, duration: number = DEFAULT_DURATION) {
    this.text.text = text
    this.text.visible = true
    this.timer = duration
  }

  destroy() {
    this.emit('destroy')
    super.destroy()
  }
}

export { Inspect }
