import { Text } from 'pixi.js'
import { Player } from './../characters/player'
import { type Entity } from './entity'

const lerp = (a: number, b: number, t: number) => {
  return a + (b - a) * t
}

const TRANSITION_DURATION = 5

class MoneyDisplay extends Text implements Entity {
  private value: number
  private displayValue: number
  private startValue: number
  private timer: number = 0
  private lastAddedAmount: number = 0
  private lastAddedAmountText: Text

  constructor() {
    super('R$ 0,00', {
      fill: 0x00ff00,
      fontFamily: 'Arial',
      fontSize: 32,
      stroke: 0x000000,
      strokeThickness: 8
    })

    this.value = 0
    this.displayValue = 0

    this.lastAddedAmountText = new Text('+ R$ 100,00', {
      fill: 0x00ff00,
      fontFamily: 'Arial',
      fontSize: 24,
      stroke: 0x000000,
      strokeThickness: 8,
      align: 'right'
    })
    this.addChild(this.lastAddedAmountText)
    this.lastAddedAmountText.position.set(0, 40)
    this.lastAddedAmountText.anchor.set(0, 0)
    this.lastAddedAmountText.visible = false
  }

  updateEntity(dt: number) {
    if (this.displayValue !== this.value) {
      if (this.timer >= TRANSITION_DURATION) {
        this.displayValue = this.value
        this.lastAddedAmountText.visible = false
      } else {
        this.timer += dt

        this.displayValue = lerp(this.startValue, this.value, this.timer / TRANSITION_DURATION)
      }
    } else {
      this.lastAddedAmountText.visible = false
    }

    this.text = `${this.formatMoney(this.displayValue)}`
  }

  destroy() {
    this.emit('destroy')
    super.destroy()
  }

  getAmount() {
    return this.value
  }

  setAmount(amount: number) {
    this.displayValue = this.value = amount
    this.timer = 0
  }

  changeAmount(amount: number) {
    if (amount === 0) {
      return
    }

    this.displayValue = this.value
    this.startValue = this.value
    this.value += amount
    this.timer = 0

    this.lastAddedAmount = amount
    this.lastAddedAmountText.text = `${amount > 0 ? '+' : '-'}${this.formatMoney(Math.abs(amount))}`
    this.lastAddedAmountText.visible = true
    this.lastAddedAmountText.style.fill = amount > 0 ? 0x00ff00 : 0xff0000
  }

  private formatMoney(value: number) {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  }
}

export { MoneyDisplay }
