import { Widget } from './widget'
import { TextWidget } from './text_widget'

const padZero = (num: number) => (num < 10 ? `0${num}` : num)

class ClockWidget extends Widget {
  public textWidget: TextWidget

  constructor() {
    super()

    this.textWidget = new TextWidget(this.getTime(), {
      textColor: 'white',
      fontSize: '16px',
      fontFamily: 'Pixelify Sans, sans-serif',
      baseline: 'top'
    })

    this.resize(this.textWidget.getWidgetSize().width, this.textWidget.getWidgetSize().height)

    this.addChild(this.textWidget)
  }

  update() {
    this.textWidget.setText(this.getTime())
  }

  private getTime() {
    const date = new Date()
    const hours = padZero(date.getHours())
    const minutes = padZero(date.getMinutes())

    return `${hours}:${minutes}`
  }
}

export { ClockWidget }
