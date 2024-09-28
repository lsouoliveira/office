import { Widget } from './../../widgets/widget'
import { TextWidget } from './../../widgets/text_widget'
import { ClockWidget } from './../../widgets/clock_widget'
import { GUI } from './../../widgets/gui'
import { System } from './../../../system'
import { OS } from './../../../windows/window'

class TitleBarGUI extends GUI {
  constructor(
    system: System,
    window: OS.Window,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    super(system, window, x, y, width, height)

    this.getRoot().style.backgroundColor = '#393E46'

    this.setupWidgets()
  }

  setupWidgets() {
    const logo = new TextWidget('INK', {
      textColor: 'white',
      fontSize: '24px',
      fontFamily: 'Pixelify Sans, sans-serif',
      baseline: 'middle'
    })
    logo.setPosition(12, 24)

    const clock = new ClockWidget()
    clock.setPosition(
      this.getSize().width - clock.getWidgetSize().width - 12,
      24 - clock.getWidgetSize().height / 2
    )

    this.getRoot().addChild(logo)
    this.getRoot().addChild(clock)
  }
}

export { TitleBarGUI }
