import { EventEmitter } from '../event_emitter'

namespace OS {
  export interface WindowOptions {
    title: string
    width: number
    height: number
    x: number
    y: number
    hasDecorations: boolean
    alwaysOnTop?: boolean
    alwaysOnBottom?: boolean
    draggable?: boolean
  }

  export class Window extends EventEmitter {
    private hasDecorations: boolean
    private title: string
    private x: number
    private y: number
    private width: number
    private height: number
    private canvas?: HTMLCanvasElement
    private context?: CanvasRenderingContext2D
    private hasFocus: boolean = false
    private alwaysOnTop: boolean = false
    private alwaysOnBottom: boolean = false
    private draggable: boolean = false
    private lastBuffer?: ImageData

    constructor(options: WindowOptions) {
      super()

      this.hasDecorations = options.hasDecorations
      this.title = options.title
      this.x = options.x
      this.y = options.y
      this.width = options.width
      this.height = options.height
      this.alwaysOnTop = options.alwaysOnTop || false
      this.alwaysOnBottom = options.alwaysOnBottom || false
      this.draggable = options.draggable == null ? true : options.draggable
    }

    init() {
      this.canvas = document.createElement('canvas')
      this.canvas.width = this.width
      this.canvas.height = this.height

      if (!this.canvas) {
        throw new Error('Failed to create canvas')
      }

      const context = this.canvas.getContext('2d')

      if (!context) {
        throw new Error('Failed to get 2d context')
      }

      this.context = context
    }

    render(context: CanvasRenderingContext2D) {
      if (!this.canvas) {
        throw new Error('Canvas not initialized')
      }

      this.renderWindowDecorations(context)
      context.drawImage(this.canvas, this.x, this.y)

      this.lastBuffer = context.getImageData(this.x, this.y, this.width, this.height)
    }

    renderWindowDecorations(context: CanvasRenderingContext2D) {
      if (!this.hasDecorations) {
        return
      }

      this.renderTitleBar(context)
    }

    renderTitleBar(context: CanvasRenderingContext2D) {
      context.fillStyle = '#EEEEEE'
      context.fillRect(this.x, this.y - 32, this.width, 32)

      if (this.hasFocus) {
        context.fillStyle = 'black'
      } else {
        context.fillStyle = '#CCCCCC'
      }

      context.font = '16px Pixelify Sans, sans-serif'
      context.textBaseline = 'middle'
      context.fillText(this.title, this.x + 8, this.y - 16)

      context.fillStyle = '#FF605C'
      context.beginPath()
      context.arc(
        this.getRealX() + this.getRealWidth() - 16,
        this.getRealY() + 16,
        8,
        0,
        Math.PI * 2
      )
      context.closePath()
      context.fill()
    }

    contains(x: number, y: number) {
      return (
        this.getRealX() <= x &&
        this.getRealX() + this.getRealWidth() >= x &&
        this.getRealY() <= y &&
        this.getRealY() + this.getRealHeight() >= y
      )
    }

    titleBarContains(x: number, y: number) {
      return (
        x >= this.getRealX() &&
        x <= this.getRealX() + this.getRealWidth() &&
        y >= this.getRealY() &&
        y <= this.getRealY() + 32
      )
    }

    getRealX() {
      return this.x
    }

    getRealY() {
      return this.y - (this.hasDecorations ? 32 : 0)
    }

    getRealWidth() {
      return this.width
    }

    getRealHeight() {
      return this.height + (this.hasDecorations ? 32 : 0)
    }

    isFocused() {
      return this.hasFocus
    }

    isDraggable() {
      return this.draggable
    }

    move(dx: number, dy: number) {
      this.x += dx
      this.y += dy
    }

    onFocus() {
      this.hasFocus = true
    }

    onBlur() {
      this.hasFocus = false
    }

    close() {
      if (!this.canvas) {
        throw new Error('Canvas not initialized')
      }

      this.canvas.remove()
      this.emit('close')
    }

    update(dt: number) {}

    getContext() {
      if (!this.context) {
        throw new Error('Context not initialized')
      }

      return this.context
    }

    getFrameBuffer() {
      return this.lastBuffer
    }

    getTitle() {
      return this.title
    }

    getWidth() {
      return this.width
    }

    getHeight() {
      return this.height
    }

    getX() {
      return this.x
    }

    getY() {
      return this.y
    }

    getZ() {
      return this.z
    }

    setPosition(x: number, y: number) {
      this.x = x
      this.y = y
    }

    resize(width: number, height: number) {
      this.width = width
      this.height = height

      if (!this.canvas) {
        throw new Error('Canvas not initialized')
      }

      this.canvas.width = width
      this.canvas.height = height
    }

    isAlwaysOnTop() {
      return this.alwaysOnTop
    }

    isAlwaysOnBottom() {
      return this.alwaysOnBottom
    }

    onMouseDown(x: number, y: number) {
      this.emit('mousedown', x, y)
    }

    onMouseUp(x: number, y: number) {
      this.emit('mouseup', x, y)
    }

    onMouseMove(x: number, y: number) {
      this.emit('mousemove', x, y)
    }

    onDoubleClick(x: number, y: number) {
      this.emit('dblclick', x, y)
    }
  }
}

export { OS }
