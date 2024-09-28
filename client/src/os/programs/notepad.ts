import { Process } from '../processes/process'
import { OS } from '../windows/window'

class Notepad extends Process {
  private window?: OS.Window

  onStart() {
    this.window = this.system.Windows().createWindow({
      title: 'Notepad',
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

    windowContext.fillStyle = 'white'
    windowContext.fillRect(0, 0, this.window.getWidth(), this.window.getHeight())

    windowContext.fillStyle = '#222831'
    windowContext.font = '32px Pixelify Sans, sans-serif'
    windowContext.textAlign = 'center'

    windowContext.fillText(
      'Aplicativo indisponível :)',
      this.window.getWidth() / 2,
      this.window.getHeight() / 2
    )
  }
}

export { Notepad }
