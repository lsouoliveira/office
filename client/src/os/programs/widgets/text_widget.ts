import { Widget } from './widget'

type TextWidgetStyle = {
  textColor: string
  fontSize: string
  fontFamily: string
  baseline?: string
  align?: string
}

const defaultWidgetStyle: TextWidgetStyle = {
  textColor: 'black',
  fontSize: '16px',
  fontFamily: 'Arial',
  baseline: 'top',
  align: 'left'
}

class TextWidget extends Widget {
  private text: string
  public textStyle: TextWidgetStyle

  constructor(text: string, textStyle = defaultWidgetStyle) {
    super()
    this.text = text
    this.textStyle = textStyle
  }

  renderWidget(context: CanvasRenderingContext2D) {
    context.fillStyle = this.textStyle.textColor
    context.font = `${this.textStyle.fontSize} ${this.textStyle.fontFamily}`
    context.textBaseline = this.textStyle.baseline
    context.textAlign = this.textStyle.align
    context.fillText(this.text, this.getOffset().x, this.getOffset().y)
  }

  setText(text: string) {
    this.text = text
  }

  getWidgetSize() {
    const context = document.createElement('canvas').getContext('2d')
    context!.font = `${this.textStyle.fontSize} ${this.textStyle.fontFamily}`
    const width = context!.measureText(this.text).width
    const height = parseInt(this.textStyle.fontSize)

    return {
      width,
      height
    }
  }
}

export { TextWidget }
