import { Process } from '../processes/process'
import { OS } from '../windows/window'
import { Desktop } from './desktop'
import { TitleBar } from './title_bar'
import { TaskBar } from './task_bar'
import { Calendar } from './calendar'

const PROGRESS_BAR_WIDTH = 400
const PROGRESS_BAR_HEIGHT = 2.5

class Startup extends Process {
  private window?: OS.Window
  private progress: number = 0

  onStart() {
    this.window = this.system.Windows().createWindow({
      title: 'Startup',
      x: 0,
      y: 0,
      width: this.system.getResolution().width,
      height: this.system.getResolution().height,
      hasDecorations: false,
      draggable: false
    })
  }

  onTerminate() {
    if (this.window) {
      this.window.close()
    }
  }

  update(dt: number) {
    const progressIncrement = Math.random() * 0.05
    this.progress = Math.min(progressIncrement + this.progress, 1)

    if (this.progress >= 1) {
      this.system.Processes().launch(Desktop)
      this.system.Processes().launch(TitleBar)
      this.system.Processes().launch(TaskBar)
      this.system.Processes().terminate(this.getPid())
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

    windowContext.fillStyle = '#222831'
    windowContext.fillRect(0, 0, this.window.getWidth(), this.window.getHeight())

    this.renderProgressBars(windowContext)
    this.renderText(windowContext)
  }

  private renderProgressBars(context: CanvasRenderingContext2D) {
    if (!this.window) {
      throw new Error('Window not initialized')
    }

    const x = this.window.getWidth() / 2 - PROGRESS_BAR_WIDTH / 2
    const y = this.window.getHeight() / 2 - PROGRESS_BAR_HEIGHT / 2 + 100

    context.fillStyle = '#393E46'
    context.fillRect(x, y, PROGRESS_BAR_WIDTH, PROGRESS_BAR_HEIGHT)

    context.fillStyle = '#fff'
    context.fillRect(x, y, PROGRESS_BAR_WIDTH * this.progress, PROGRESS_BAR_HEIGHT)
  }

  private renderText(context: CanvasRenderingContext2D) {
    if (!this.window) {
      throw new Error('Window not initialized')
    }

    const x = this.window.getWidth() / 2
    const y = this.window.getHeight() / 2

    context.fillStyle = '#FFF'
    context.font = '32px Pixelify Sans, sans-serif'
    context.textAlign = 'center'

    context.fillText('INK OS', x, y)
  }
}

export { Startup }
