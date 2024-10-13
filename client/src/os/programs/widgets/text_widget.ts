import { Widget } from './widget'

type TextWidgetStyle = {
  textColor: string
  fontSize: string
  fontFamily: string
  baseline?: string
  align?: string
  wordWrap?: boolean
}

const defaultWidgetStyle: TextWidgetStyle = {
  textColor: 'black',
  fontSize: '16px',
  fontFamily: 'Arial',
  baseline: 'top',
  align: 'left',
  fontWeight: 'normal',
  wordWrap: false
}

const FONT_WEIGHT = {
  normal: 500,
  bold: 700
}

class TextWidget extends Widget {
  private text: string
  public textStyle: TextWidgetStyle

  constructor(text: string, textStyle = defaultWidgetStyle) {
    super()
    this.text = text
    this.textStyle = { ...defaultWidgetStyle, ...textStyle }
  }

  renderWidget(context: CanvasRenderingContext2D) {
    context.fillStyle = this.textStyle.textColor
    context.font = `${FONT_WEIGHT[this.textStyle.fontWeight]} ${this.textStyle.fontSize} ${this.textStyle.fontFamily}`
    context.textBaseline = this.textStyle.baseline
    context.textAlign = this.textStyle.align

    if (this.textStyle.wordWrap && this.getParent()) {
      let x = 0
      let y = 0

      for (let i = 0; i < this.text.length; i++) {
        const c = this.text[i]

        if (c === '\n') {
          y += parseInt(this.textStyle.fontSize)
          x = 0

          continue
        }

        const character = c
        const characterWidth = context.measureText(character).width

        if (x + characterWidth > this.getParent()!.getWidgetSize().width) {
          y += parseInt(this.textStyle.fontSize)
          x = 0
        }

        context.fillText(character, this.getOffset().x + x, this.getOffset().y + y)
        x += characterWidth
      }
    } else {
      context.fillText(this.text, this.getOffset().x, this.getOffset().y)
    }
  }

  setText(text: string) {
    this.text = text
  }

  getWidgetSize() {
    const context = document.createElement('canvas').getContext('2d')
    context!.font = `${this.textStyle.fontSize} ${this.textStyle.fontFamily}`
    const width = context!.measureText(this.text).width
    const height = parseInt(this.textStyle.fontSize) * this.countLines()

    return {
      width,
      height
    }
  }

  countLines() {
    return this.text.split('\n').length
  }
}

export { TextWidget }
