import { Widget } from './../../widgets/widget'
import { TextWidget } from './../../widgets/text_widget'
import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'

class EventWidget extends Widget {
  private color: string
  private label: TextWidget

  constructor(title: string, color: string) {
    super()

    this.color = color

    this.label = new TextWidget(title, {
      textColor: 'black',
      fontSize: '10px',
      fontFamily: 'Pixelify Sans, sans-serif',
      baseline: 'top',
      align: 'left',
      wordWrap: true
    })

    this.addChild(this.label)
  }

  update(dt: number) {
    super.update(dt)

    this.label.setPosition(2, 4)
  }

  renderWidget(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color
    ctx.beginPath()
    ctx.roundRect(
      this.getOffset().x,
      this.getOffset().y,
      this.getWidgetSize().width,
      this.label.getWidgetSize().height + 8,
      4
    )
    ctx.closePath()
    ctx.fill()
  }
}

export { EventWidget }
