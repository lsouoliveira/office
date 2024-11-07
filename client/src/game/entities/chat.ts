import { Container, Text, CanvasTextMetrics } from 'pixi.js'
import { Player } from './../characters/player'
import { type Entity } from './entity'

const formatTime = (date: Date) => {
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')

  return `${hours}:${minutes}`
}

class Chat extends Container implements Entity {
  private messages: Text[] = []
  private maxMessages: number = 5

  constructor({ maxMessages }: { maxMessages: number }) {
    super()

    this.maxMessages = maxMessages
  }

  addMessage(playerName: string, message: string) {
    const newMessage = this.createMessage(playerName, message)
    newMessage.position.set(0, 0)

    this.messages.push(newMessage)
    this.addChild(newMessage)

    if (this.messages.length > this.maxMessages) {
      this.messages.shift()?.destroy()
    }

    this.updateLayout()
  }

  updateEntity(dt: number) {}

  updateLayout() {
    let y = 0

    this.messages.forEach((message) => {
      const textMetrics = CanvasTextMetrics.measureText(message.text, message.style)

      message.position.set(0, y)

      y += textMetrics.lines.length * textMetrics.lineHeight
    })
  }

  createMessage(playerName: string, message: string) {
    const now = new Date()
    const time = formatTime(now)
    const formattedMessage = `${time} ${playerName} diz: ${message}`

    const newMessage = new Text(formattedMessage, {
      fill: 0xffff00,
      fontFamily: 'Arial',
      fontSize: 16,
      stroke: 0x000000,
      strokeThickness: 4,
      wordWrap: true,
      wordWrapWidth: window.innerWidth * 0.3,
      breakWords: true,
      lineHeight: 20
    })

    return newMessage
  }
}

export { Chat }
