import { Process } from '../processes/process'
import { OS } from '../windows/window'
import { TitleBarGUI } from './components/title_bar_gui/title_bar_gui'

class TitleBar extends Process {
  private window?: OS.Window
  private progress: number = 0
  private titleBarGUI?: TitleBarGUI

  onStart() {
    this.window = this.system.Windows().createWindow({
      title: 'TitleBar',
      x: 0,
      y: 0,
      width: this.system.getResolution().width,
      height: 48,
      hasDecorations: false,
      alwaysOnTop: true,
      draggable: false
    })

    if (!this.window) {
      throw new Error('Window not initialized')
    }

    this.titleBarGUI = new TitleBarGUI(
      this.system,
      this.window,
      0,
      0,
      this.system.getResolution().width,
      48
    )
  }

  onTerminate() {
    if (this.window) {
      this.window.close()
    }
  }

  update(dt: number) {}

  render() {
    if (!this.window) {
      throw new Error('Window not initialized')
    }

    const windowContext = this.window.getContext()

    if (!windowContext) {
      throw new Error('Context not initialized')
    }

    windowContext.clearRect(0, 0, this.window.getWidth(), this.window.getHeight())

    this.titleBarGUI?.render(windowContext)
  }
}

export { TitleBar }
