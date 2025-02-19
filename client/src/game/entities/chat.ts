import { Container, Text, CanvasTextMetrics } from 'pixi.js'
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

  updateEntity() {}

  updateLayout() {
    let y = 0

    this.messages.forEach((message) => {
      const textMetrics = CanvasTextMetrics.measureText(message.text, message.style)

      message.position.set(0, y)

      y += textMetrics.lines.length * textMetrics.lineHeight
    })

    this.position.set(this.position.x, window.innerHeight - 8 - y)
  }

  clear() {
    this.messages.forEach((message) => message.destroy())
    this.messages = []
  }

  createMessage(playerName: string, message: string) {
    return new Text(
      this.formattedMessageFor(playerName, message), 
      {
        fill: 0xffff00,
        fontFamily: 'Arial',
        fontSize: 16,
        stroke: 0x000000,
        strokeThickness: 4,
        wordWrap: true,
        wordWrapWidth: window.innerWidth * 0.3,
        breakWords: true,
        lineHeight: 20
      }
    )
  }

  formattedMessageFor(playerName: string, message: string) {
    return `${formatTime(new Date())} ${playerName} diz: ${message}`
  }
}

export { Chat }
