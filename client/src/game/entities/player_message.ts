import { Text } from 'pixi.js'
import { Player } from './../characters/player'
import { type Entity } from './entity'

const DEFAULT_DURATION = 2.5

class PlayerMessage extends Text implements Entity {
  private duration: number
  private timer: number

  constructor(message, duration = DEFAULT_DURATION) {
    super(message, {
      fill: 0xffff00,
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

  static show(player: Player, message: string, duration = DEFAULT_DURATION) {
    const formattedMessage = `${player.name} diz: ${message}`
    const playerMessage = new PlayerMessage(formattedMessage, duration)

    playerMessage.position.set(player.x + 8, player.y - 16)
    playerMessage.anchor.set(0.5, 1)
    playerMessage.scale.set(8 / 256)

    return playerMessage
  }
}

export { PlayerMessage }
