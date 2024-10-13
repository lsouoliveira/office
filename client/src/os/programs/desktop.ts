import { Process } from '../processes/process'
import { OS } from '../windows/window'
import { DesktopGUI } from './components/desktop_gui/desktop_gui'
import { Snake } from './snake'
import { Notepad } from './notepad'
import { Calendar } from './calendar'

interface DesktopFile {
  id: string
  name: string
  image_path: string
  process?: any
}

class Desktop extends Process {
  private window?: OS.Window
  private progress: number = 0
  private desktopGUI?: DesktopGUI
  private files: DesktopFile[] = [
    {
      id: 'notepad',
      name: 'Notepad',
      image_path: 'resources/images/notepad.png',
      process: Notepad
    },
    {
      id: 'snake',
      name: 'Snake',
      image_path: 'resources/images/snake.png',
      process: Snake
    },
    {
      id: 'calendar',
      name: 'Calendar',
      image_path: 'resources/images/calendar.png',
      process: Calendar
    }
  ]

  onStart() {
    this.window = this.system.Windows().createWindow({
      title: 'Desktop',
      x: 0,
      y: 48,
      width: this.system.getResolution().width,
      height: this.system.getResolution().height - 48,
      hasDecorations: false,
      alwaysOnBottom: true,
      draggable: false
    })

    if (!this.window) {
      throw new Error('Window not initialized')
    }

    this.desktopGUI = new DesktopGUI(
      this.system,
      this.window,
      0,
      0,
      this.system.getResolution().width,
      this.system.getResolution().height
    )

    this.files.forEach((file) => {
      this.desktopGUI?.addFile(file)
    })
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

    this.desktopGUI?.render(windowContext)
  }
}

export { Desktop, type DesktopFile }
