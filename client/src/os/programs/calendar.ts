import { Process } from '../processes/process'
import { OS } from '../windows/window'
import { CalendarGUI } from './components/calendar_gui/calendar_gui'

class Calendar extends Process {
  private window?: OS.Window
  private calendarGUI: CalendarGUI

  onStart() {
    this.window = this.system.Windows().createWindow({
      title: 'Calendar',
      x: this.system.getResolution().width / 2 - 320,
      y: this.system.getResolution().height / 2 - 240,
      width: 640,
      height: 480,
      hasDecorations: true,
      draggable: true
    })

    if (!this.window) {
      throw new Error('Window not initialized')
    }

    this.calendarGUI = new CalendarGUI(this.system, this.window, 0, 0, 640, 480)
  }

  update(dt: number) {
    this.calendarGUI.update(dt)
  }

  onTerminate() {
    if (this.window) {
      this.window.close()
    }
  }

  render() {
    if (!this.window) {
      throw new Error('Window not initialized')
    }

    const windowContext = this.window.getContext()

    if (!windowContext) {
      throw new Error('Context not initialized')
    }

    windowContext.clearRect(0, 0, this.window.getWidth(), this.window.getHeight())

    this.calendarGUI?.render(windowContext)
  }
}

export { Calendar }
