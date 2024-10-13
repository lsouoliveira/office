import { Widget } from './widget'

class ButtonWidget extends Widget {
  private text: string

  constructor(text: string) {
    super()
    this.text = text
  }

  renderWidget(context: CanvasRenderingContext2D) {
    context.fillStyle = 'white'
    context.fillRect(
      this.getOffset().x,
      this.getOffset().y,
      this.getWidgetSize().width,
      this.getWidgetSize().height
    )

    context.strokeStyle = '#d3d3d3'
    context.beginPath()
    context.roundRect(
      this.getOffset().x,
      this.getOffset().y,
      this.getWidgetSize().width,
      this.getWidgetSize().height,
      [4]
    )
    context.stroke()
    context.closePath()

    context.fillStyle = 'black'
    context.font = `12px Pixelify Sans, sans-serif`
    context.textBaseline = 'middle'
    context.textAlign = 'center'
    context.fillText(
      this.text,
      this.getOffset().x + this.width / 2,
      this.getOffset().y + this.height / 2
    )
  }
}

export { ButtonWidget }
