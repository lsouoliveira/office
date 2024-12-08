import { Component } from './component'
import * as PIXI from 'pixi.js'

class SpriteComponent extends Component {
  sprite: PIXI.Sprite

  constructor(texture: PIXI.Texture) {
    super('SpriteComponent')

    this.sprite = new PIXI.Sprite(texture)
  }

  start() {
    this.game.app.stage.addChild(this.sprite)
  }

  update() {
    this.sprite.position.set(this.transform.position.x, this.transform.position.y)
    this.sprite.rotation = (this.transform.localRotation.y * Math.PI) / 180
  }

  destroy() {
    super.destroy()

    this.game.app.stage.removeChild(this.sprite)
  }
}

export { SpriteComponent }
