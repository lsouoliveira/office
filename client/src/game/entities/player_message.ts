import { Text } from 'pixi.js'
import { Player } from './../characters/player'
import { type Entity } from './entity'

const DEFAULT_DURATION = 2.5
const COLORS = {
  yellow: 0xffff00,
  gray: 0x808080,
  blue: 0x0000ff,
  green: 0x00ff00
}

class PlayerMessage extends Text implements Entity {
  private duration: number
  private timer: number

  constructor(message, duration = DEFAULT_DURATION, color: number) {
    super(message, {
      fill: color,
      fontFamily: 'Arial',
      fontSize: 256,
      stroke: 0x000000,
      strokeThickness: 32
    })

    this.duration = duration
    this.timer = 0
  }

  updateEntity(dt: number) {
    this.timer += dt

    if (this.timer >= this.duration) {
      this.destroy()
    }
  }

  static show(
    player: Player,
    message: string,
    color: string,
    compact: boolean,
    duration = DEFAULT_DURATION
  ) {
    let formattedMessage = message

    if (!compact) {
      formattedMessage = `${player.getName()} diz: ` + formattedMessage
    }

    const messageColor = COLORS[color] || 0xffff00
    const playerMessage = new PlayerMessage(formattedMessage, duration, messageColor)

    playerMessage.position.set(player.x + 8, player.y - 16)
    playerMessage.anchor.set(0.5, 1)
    playerMessage.scale.set(8 / 256)

    return playerMessage
  }

  destroy() {
    this.emit('destroy')
    super.destroy()
  }
}

export { PlayerMessage }
