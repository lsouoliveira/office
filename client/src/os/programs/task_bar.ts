import { Process } from '../processes/process'
import { OS } from '../windows/window'
import { TaskBarGUI } from './components/task_bar_gui/task_bar_gui'

class TaskBar extends Process {
  private window?: OS.Window
  private taskBarGUI?: TaskBarGUI

  onStart() {
    this.window = this.system.Windows().createWindow({
      title: 'TaskBar',
      x: 0,
      y: this.system.getResolution().height - 48,
      width: this.system.getResolution().width,
      height: 48,
      hasDecorations: false,
      alwaysOnTop: true,
      draggable: false
    })

    if (!this.window) {
      throw new Error('Window not initialized')
    }

    this.taskBarGUI = new TaskBarGUI(
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

  update(dt: number) {
    if (!this.window) {
      throw new Error('Window not initialized')
    }

    if (!this.taskBarGUI) {
      throw new Error('TaskBarGUI not initialized')
    }

    this.taskBarGUI.update()
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

    this.taskBarGUI?.render(windowContext)
  }
}

export { TaskBar }
