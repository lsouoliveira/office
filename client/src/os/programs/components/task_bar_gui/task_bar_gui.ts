import { Widget } from './../../widgets/widget'
import { GUI } from './../../widgets/gui'
import { System } from './../../../system'
import { OS } from './../../../windows/window'
import { WindowTabWidget } from './../../widgets/window_tab_widget'

class TaskBarGUI extends GUI {
  private windowTabWidgets: WindowTabWidget[] = []

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

    this.getSystem().Windows().on('window-created', this.onWindowCreated.bind(this))
    this.getSystem().Windows().on('window-closed', this.onWindowClosed.bind(this))
  }

  update() {
    for (let i = 0; i < this.windowTabWidgets.length; i++) {
      const windowTabWidget = this.windowTabWidgets[i]

      windowTabWidget.setPosition(
        i * (windowTabWidget.getWidgetSize().width + 8) + 8,
        this.getRoot().getWidgetSize().height / 2 - windowTabWidget.getWidgetSize().height / 2
      )

      if (windowTabWidget.window.isFocused()) {
        windowTabWidget.style.backgroundColor = '#52575D'
      } else {
        windowTabWidget.style.backgroundColor = '#41444B'
      }

      windowTabWidget.update()
    }
  }

  private onWindowCreated(window: OS.Window) {
    const windowTabWidget = new WindowTabWidget(window)

    windowTabWidget.on('mousedown', () => {
      setTimeout(() => {
        this.getSystem().Windows().setFocus(window)
      }, 100)
    })

    this.windowTabWidgets.push(windowTabWidget)

    this.getRoot().addChild(windowTabWidget)
  }

  private onWindowClosed(window: OS.Window) {
    const index = this.windowTabWidgets.findIndex(
      (windowTabWidget) => windowTabWidget.window === window
    )

    if (index !== -1) {
      this.getRoot().removeChild(this.windowTabWidgets[index])
      this.windowTabWidgets.splice(index, 1)
    }
  }
}

export { TaskBarGUI }
