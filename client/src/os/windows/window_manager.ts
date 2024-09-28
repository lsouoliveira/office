import { OS } from './window'
import { System } from './../system'
import { EventEmitter } from './../event_emitter'

class WindowManager extends EventEmitter {
  private windows: OS.Window[] = []
  private system: System
  private focusedWindow?: OS.Window
  private isDragging: boolean = false
  private startMousePosition: { x: number; y: number } = { x: 0, y: 0 }
  private startWindowPosition: { x: number; y: number } = { x: 0, y: 0 }

  constructor(system: System) {
    super()

    this.system = system
  }

  setup() {
    this.setupEvents()
  }

  setupEvents() {
    this.setupMouseEvents()
  }

  setupMouseEvents() {
    this.system.getCanvas()?.addEventListener('mousedown', (event) => {
      const x = event.clientX - this.system.getCanvas()!.getBoundingClientRect().left
      const y = event.clientY - this.system.getCanvas()!.getBoundingClientRect().top

      for (let i = this.windows.length - 1; i >= 0; i--) {
        const offsetX = x - this.windows[i].getX()
        const offsetY = y - this.windows[i].getY()

        const window = this.windows[i]

        if (window.contains(x, y)) {
          if (
            x >= window.getRealX() + window.getRealWidth() - 24 &&
            x <= window.getRealX() + window.getRealWidth() - 16 &&
            y >= window.getRealY() + 8 &&
            y <= window.getRealY() + 24
          ) {
            window.close()

            return
          }

          window.onMouseDown(offsetX, offsetY)

          this.setFocus(window)

          if (window.isDraggable() && window.titleBarContains(x, y)) {
            this.isDragging = true
            this.startMousePosition = { x, y }
            this.startWindowPosition = { x: window.getX(), y: window.getY() }
          }

          return
        }
      }

      this.clearFocus()
    })

    this.system.getCanvas()?.addEventListener('mousemove', (event) => {
      const x = event.clientX - this.system.getCanvas()!.getBoundingClientRect().left
      const y = event.clientY - this.system.getCanvas()!.getBoundingClientRect().top

      if (this.isDragging && this.focusedWindow) {
        this.focusedWindow.setPosition(
          this.startWindowPosition.x + x - this.startMousePosition.x,
          this.startWindowPosition.y + y - this.startMousePosition.y
        )

        if (this.focusedWindow.getRealY() < 48) {
          this.focusedWindow.setPosition(this.focusedWindow.getX(), 48 + 32)
        }

        if (this.focusedWindow.getX() < 0) {
          this.focusedWindow.setPosition(0, this.focusedWindow.getY())
        }
      }

      if (this.focusedWindow && this.focusedWindow.contains(x, y)) {
        const offsetX = x - this.focusedWindow.getX()
        const offsetY = y - this.focusedWindow.getY()

        this.focusedWindow.onMouseMove(offsetX, offsetY)
      }
    })

    this.system.getCanvas()?.addEventListener('mouseup', (event) => {
      this.isDragging = false

      const x = event.clientX - this.system.getCanvas()!.getBoundingClientRect().left
      const y = event.clientY - this.system.getCanvas()!.getBoundingClientRect().top

      if (this.focusedWindow && this.focusedWindow.contains(x, y)) {
        const offsetX = x - this.focusedWindow.getX()
        const offsetY = y - this.focusedWindow.getY()

        this.focusedWindow.onMouseUp(offsetX, offsetY)
      }
    })

    this.system.getCanvas()?.addEventListener('dblclick', (event) => {
      const x = event.clientX - this.system.getCanvas()!.getBoundingClientRect().left
      const y = event.clientY - this.system.getCanvas()!.getBoundingClientRect().top

      if (this.focusedWindow && this.focusedWindow.contains(x, y)) {
        const offsetX = x - this.focusedWindow.getX()
        const offsetY = y - this.focusedWindow.getY()

        this.focusedWindow.onDoubleClick(offsetX, offsetY)
      }
    })
  }

  createWindow(options: OS.WindowOptions) {
    const window = new OS.Window(options)
    window.init()

    window.on('close', () => {
      const index = this.windows.indexOf(window)

      if (index !== -1) {
        this.windows.splice(index, 1)
      }

      if (this.focusedWindow === window) {
        this.focusedWindow = undefined
      }

      this.emit('window-closed', window)
    })

    this.windows.push(window)

    this.setFocus(window)

    this.emit('window-created', window)

    return window
  }

  setFocus(window: OS.Window) {
    this.focusOnWindow(window)

    this.focusedWindow?.onBlur()
    this.focusedWindow = window
    this.focusedWindow.onFocus()
  }

  clearFocus() {
    this.focusedWindow?.onBlur()
    this.focusedWindow = undefined
  }

  update(dt: number) {
    this.windows.forEach((window) => window.update(dt))
  }

  render(context: CanvasRenderingContext2D) {
    for (const window of this.windows) {
      window.render(context)
    }
  }

  private focusOnWindow(window: OS.Window) {
    const windows = this.windows.filter((w) => w !== window)
    const alwaysOnTop = windows.filter((window) => window.isAlwaysOnTop())
    const alwaysOnBottom = windows.filter((window) => window.isAlwaysOnBottom())
    const normal = windows.filter((window) => !window.isAlwaysOnTop() && !window.isAlwaysOnBottom())

    if (window.isAlwaysOnTop()) {
      alwaysOnTop.push(window)
    }

    if (window.isAlwaysOnBottom()) {
      alwaysOnBottom.unshift(window)
    }

    if (!window.isAlwaysOnTop() && !window.isAlwaysOnBottom()) {
      normal.push(window)
    }

    this.windows = [...alwaysOnBottom, ...normal, ...alwaysOnTop]
  }
}

export { WindowManager }
