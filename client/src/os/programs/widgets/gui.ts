import { Widget } from './widget'
import { System } from './../../system'
import { OS } from './../../windows/window'

class GUI {
  private root: Widget
  private focusedWidget: Widget | null = null
  private system: System
  private window: OS.Window
  private x: number
  private y: number
  private width: number
  private height: number

  constructor(
    system: System,
    window: OS.Window,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    this.root = new Widget()
    this.system = system
    this.window = window
    this.x = x
    this.y = y
    this.width = width
    this.height = height

    this.root.resize(width, height)

    this.setupMouseEvents()
    // this.setupKeyboardEvents()
  }

  update(dt: number) {
    this.root.update(dt)
  }

  getRoot() {
    return this.root
  }

  render(context: CanvasRenderingContext2D) {
    this.root.render(context)
  }

  setFocusedWidget(widget: Widget | null) {
    if (this.focusedWidget) {
      this.focusedWidget.clearFocus()
    }

    this.focusedWidget = widget
  }

  getSize() {
    return {
      width: this.width,
      height: this.height
    }
  }

  getSystem() {
    return this.system
  }

  private setupMouseEvents() {
    this.window.on('mousedown', (x, y) => {
      const offsetX = x - this.x
      const offsetY = y - this.y

      console.log(offsetX, offsetY)

      if (!this.root.contains(offsetX, offsetY)) {
        return
      }

      this.root.onMouseDown(offsetX, offsetY)
    })

    this.window.on('mouseup', (x, y) => {
      const offsetX = x - this.x
      const offsetY = y - this.y

      if (!this.root.contains(offsetX, offsetY)) {
        return
      }

      this.root.onMouseUp(offsetX, offsetY)
    })

    this.window.on('mousemove', (x, y) => {
      const offsetX = x - this.x
      const offsetY = y - this.y

      if (!this.root.contains(offsetX, offsetY)) {
        return
      }

      this.root.onMouseMove(offsetX, offsetY)
    })

    this.window.on('dblclick', (x, y) => {
      const offsetX = x - this.x
      const offsetY = y - this.y

      if (!this.root.contains(offsetX, offsetY)) {
        return
      }

      this.root.onDoubleClick(offsetX, offsetY)
    })
  }

  private setupKeyboardEvents() {
    window.addEventListener('keydown', (event) => {
      if (this.focusedWidget) {
        this.focusedWidget.onKeyPress(event.key)
      }
    })

    window.addEventListener('keyup', (event) => {
      if (this.focusedWidget) {
        this.focusedWidget.onKeyUp(event.key)
      }
    })
  }
}

export { GUI }
