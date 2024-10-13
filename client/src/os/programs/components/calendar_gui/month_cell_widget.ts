import { Widget } from './../../widgets/widget'
import { TextWidget } from './../../widgets/text_widget'
import { EventWidget } from './event_widget'
import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'

class MonthCellWidget extends Widget {
  private date: dayjs.Dayjs
  private label: TextWidget
  private isHighlighted = false
  private isToday = false
  private events: EventWidget[] = []

  constructor(date: dayjs.Dayjs, isHighlighted = false, isToday = false) {
    super()

    this.date = date
    this.isHighlighted = isHighlighted
    this.isToday = isToday

    this.label = new TextWidget(date.format('D'), {
      textColor: this.getTextColor(),
      fontSize: '16px',
      fontFamily: 'Pixelify Sans, sans-serif',
      baseline: 'top',
      align: 'left'
    })

    this.addChild(this.label)
  }

  update(dt: number) {
    super.update(dt)

    this.label.setPosition(this.getWidgetSize().width - this.label.getWidgetSize().width - 8, 8)
    this.label.textStyle.textColor = this.getTextColor()

    for (let i = 0; i < this.events.length; i++) {
      const event = this.events[i]
      event.setPosition(0, (event.getWidgetSize().height + 1) * i + 32)
    }
  }

  renderWidget(context: CanvasRenderingContext2D) {
    context.fillStyle = this.getBackgroundColor()
    context.fillRect(
      this.getOffset().x,
      this.getOffset().y,
      this.getWidgetSize().width,
      this.getWidgetSize().height
    )

    context.strokeStyle = this.getBorderColor()
    context.beginPath()
    context.strokeRect(
      this.getOffset().x,
      this.getOffset().y,
      this.getWidgetSize().width,
      this.getWidgetSize().height
    )
    context.closePath()

    if (this.isToday) {
      context.fillStyle = '#ef4444'
      context.beginPath()
      context.arc(
        this.label.getOffset().x + this.label.getWidgetSize().width / 2,
        this.label.getOffset().y + this.label.getWidgetSize().height / 2,
        12,
        0,
        2 * Math.PI
      )
      context.fill()
      context.closePath()
    }
  }

  addEvent(title: string, color: string) {
    const event = new EventWidget(title, color)
    event.resize(this.getWidgetSize().width, 16)
    this.events.push(event)
    this.addChild(event)
  }

  private getBackgroundColor() {
    if (this.isHighlighted) {
      return '#f9f9f9'
    }

    return '#ffffff'
  }

  private getBorderColor() {
    return '#d3d3d3'
  }

  private getTextColor() {
    if (this.isToday) {
      return 'white'
    }

    return this.isHighlighted ? '#d3d3d3' : 'black'
  }
}

export { MonthCellWidget }
