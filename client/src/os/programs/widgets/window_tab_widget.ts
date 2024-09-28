import { Widget } from './widget'
import { TextWidget } from './text_widget'
import { OS } from './../../windows/window'

class WindowTabWidget extends Widget {
  public textWidget: TextWidget
  public window: OS.Window

  constructor(window: OS.Window) {
    super()

    this.window = window

    this.resize(196, 32)

    this.textWidget = new TextWidget(window.getTitle(), {
      textColor: 'white',
      fontSize: '16px',
      fontFamily: 'Pixelify Sans, sans-serif',
      baseline: 'middle'
    })
    this.style.backgroundColor = '#52575D'
    this.textWidget.setPosition(16, this.getWidgetSize().height / 2)

    this.addChild(this.textWidget)
  }

  update() {
    this.textWidget.setText(this.window.getTitle())
  }
}

export { WindowTabWidget }
