import { WindowManager } from './windows/window_manager'
import { ProcessManager } from './processes/process_manager'
import { Input } from './input'

const SYSTEM_RESOLUTION = {
  width: 1280,
  height: 720
}

class System {
  private root: HTMLElement
  private windowManager: WindowManager
  private processManager: ProcessManager
  private input: Input
  private canvas?: HTMLCanvasElement
  private context?: CanvasRenderingContext2D
  private surfaceCanvas?: HTMLCanvasElement
  private surfaceContext?: CanvasRenderingContext2D
  private lastFrameTime: number = 0
  private isRunning: boolean = true

  constructor(root: HTMLElement) {
    this.root = root
    this.windowManager = new WindowManager(this)
    this.processManager = new ProcessManager(this)
    this.input = new Input()
  }

  init() {
    this.canvas = document.createElement('canvas')
    this.canvas.width = this.root.clientWidth
    this.canvas.height = this.root.clientHeight

    if (!this.canvas) {
      throw new Error('Failed to create canvas')
    }

    this.context = this.canvas.getContext('2d')

    if (!this.context) {
      throw new Error('Failed to get 2d context')
    }

    this.root.appendChild(this.canvas)

    this.input.setup()
    this.windowManager.setup()
  }

  start() {
    window.requestAnimationFrame(this.loop.bind(this))
  }

  loop(frameTime: number) {
    if (!this.isRunning) {
      return
    }

    const dt = (frameTime - this.lastFrameTime) / 1000
    this.lastFrameTime = frameTime

    this.update(dt)
    this.render()

    window.requestAnimationFrame(this.loop.bind(this))
  }

  update(dt: number) {
    this.processManager.update(dt)
    this.windowManager.update(dt)
  }

  render() {
    if (!this.canvas || !this.context) {
      throw new Error('Failed to get 2d context')
    }

    const surfaceCanvas = document.createElement('canvas')
    surfaceCanvas.width = SYSTEM_RESOLUTION.width
    surfaceCanvas.height = SYSTEM_RESOLUTION.height

    const surfaceContext = surfaceCanvas.getContext('2d')

    if (!surfaceContext) {
      throw new Error('Failed to get 2d context')
    }

    surfaceContext.fillStyle = 'black'
    surfaceContext.fillRect(0, 0, surfaceCanvas.width, surfaceCanvas.height)

    this.processManager.render(surfaceContext)
    this.windowManager.render(surfaceContext)

    this.canvas.width = this.root.clientWidth
    this.canvas.height = this.root.clientHeight

    this.context.fillStyle = 'black'
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)

    this.context.drawImage(
      surfaceCanvas,
      0,
      0,
      surfaceCanvas.width,
      surfaceCanvas.height,
      0,
      0,
      this.canvas.width,
      this.canvas.height
    )
  }

  getResolution() {
    return SYSTEM_RESOLUTION
  }

  launch(process_class: any) {
    this.processManager.launch(process_class)
  }

  teardown() {
    this.isRunning = false
    this.input.teardown()
  }

  Windows() {
    return this.windowManager
  }

  Processes() {
    return this.processManager
  }

  InputSystem() {
    return this.input
  }

  getCanvas() {
    return this.canvas
  }

  getScreenCoordinates(x: number, y: number) {
    if (!this.canvas) {
      throw new Error('Failed to get canvas')
    }

    const scaleX = this.canvas.width / SYSTEM_RESOLUTION.width
    const scaleY = this.canvas.height / SYSTEM_RESOLUTION.height

    return {
      x: x / scaleX,
      y: y / scaleY
    }
  }
}

export { System }
