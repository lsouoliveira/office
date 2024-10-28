const WIDTH = 480
const HEIGHT = 640
const COURT_BORDER_WIDTH = 2
const OUTSIDE_BORDER_WIDTH = 0
const PAD_WIDTH = 80
const PAD_HEIGHT = 12
const PAD1_OFFSET_Y = OUTSIDE_BORDER_WIDTH + 10
const PAD2_OFFSET_Y = HEIGHT - OUTSIDE_BORDER_WIDTH - PAD_HEIGHT - 10
const BALL_RADIUS = 8
const BALL_START_SPEED = 350
const PAD_INTERPOLATION_SPEED = 25

enum StageType {
  WAITING_FOR_PLAYERS,
  PLAYING,
  WAITING_FOR_REMATCH,
  COUNTDOWN
}

interface Stage {
  update: (dt: number) => void
  draw: (ctx: CanvasRenderingContext2D) => void
  destroy?: () => void
}

class Renderer {
  static drawCourt(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    const innerWidth = width - OUTSIDE_BORDER_WIDTH * 2
    const innerHeight = height - OUTSIDE_BORDER_WIDTH * 2
    const offsetX = x + OUTSIDE_BORDER_WIDTH
    const offsetY = y + OUTSIDE_BORDER_WIDTH

    ctx.fillStyle = 'black'
    ctx.fillRect(x, y, width, height)

    ctx.fillStyle = '#539ae2'
    ctx.fillRect(offsetX, offsetY, innerWidth, innerHeight)

    ctx.strokeStyle = 'white'
    ctx.lineWidth = COURT_BORDER_WIDTH
    ctx.strokeRect(
      offsetX + COURT_BORDER_WIDTH / 2,
      offsetY + COURT_BORDER_WIDTH / 2,
      innerWidth - COURT_BORDER_WIDTH,
      innerHeight - COURT_BORDER_WIDTH + 1
    )

    // center line
    ctx.setLineDash([4 * COURT_BORDER_WIDTH, 4 * COURT_BORDER_WIDTH])
    ctx.beginPath()
    ctx.moveTo(offsetX, offsetY + innerHeight / 2)
    ctx.lineTo(offsetX + innerWidth, offsetY + innerHeight / 2)
    ctx.stroke()
    ctx.setLineDash([])

    ctx.beginPath()
    ctx.moveTo(offsetX + innerWidth / 2, offsetY)
    ctx.lineTo(offsetX + innerWidth / 2, offsetY + innerHeight)
    ctx.stroke()
    ctx.closePath()
  }

  static drawText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    fontSize: number,
    align: CanvasTextAlign = 'center',
    baseline: CanvasTextBaseline = 'middle'
  ) {
    ctx.font = `${fontSize}px Pixelify Sans, sans-serif`
    ctx.textAlign = align
    ctx.textBaseline = baseline
    ctx.fillStyle = 'white'
    ctx.fillText(text, x, y)
  }

  static drawAnnouncementText(ctx: CanvasRenderingContext2D, text: string) {
    const textWidth = Renderer.measureText(ctx, text, 24).width

    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
    ctx.fillRect(WIDTH / 2 - textWidth / 2 - 10, HEIGHT / 2 - 20, textWidth + 20, 40)

    Renderer.drawText(ctx, text, WIDTH / 2, HEIGHT / 2, 24)
  }

  static measureText(ctx: CanvasRenderingContext2D, text: string, fontSize: number) {
    ctx.font = `${fontSize}px Pixelify Sans, sans-serif`

    return ctx.measureText(text)
  }
}

const lerp = (a: number, b: number, t: number) => {
  return a + (b - a) * t
}

class Pad {
  private x: number
  private y: number
  private width: number
  private height: number
  private targetPositionX: number
  private interpolatePosition: boolean

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.targetPositionX = x
  }

  update(dt: number) {
    if (!this.interpolatePosition) {
      return
    }

    const distance = Math.abs(this.targetPositionX - this.x)

    if (distance < 1) {
      this.x = this.targetPositionX
      return
    }

    this.x = lerp(this.x, this.targetPositionX, dt * PAD_INTERPOLATION_SPEED)
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'white'
    ctx.fillRect(this.x, this.y, this.width, this.height)
  }

  getPosition() {
    return { x: this.x, y: this.y }
  }

  setPosition(x: number, y: number) {
    this.x = x
    this.y = y
  }

  setTargetPosition(x: number, y: number) {
    this.targetPositionX = x
  }

  setInterpolatePosition(interpolate: boolean) {
    this.interpolatePosition = interpolate
  }
}

class Ball {
  private x: number
  private y: number
  private radius: number
  private direction: number[]
  private speed: number

  constructor(x: number, y: number, radius: number) {
    this.x = x
    this.y = y
    this.radius = radius
    this.direction = [0, 0]
    this.speed = BALL_START_SPEED
  }

  getPosition() {
    return { x: this.x, y: this.y }
  }

  setPosition(x: number, y: number) {
    this.x = x
    this.y = y
  }

  setDirection(direction: number[]) {
    this.direction = direction
  }

  getDirection() {
    return this.direction
  }

  getSpeed() {
    return this.speed
  }

  setSpeed(speed: number) {
    this.speed = speed
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'white'
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    ctx.fill()
  }
}

class WaitingForPlayersStage implements Stage {
  update(dt: number) {}

  draw(ctx: CanvasRenderingContext2D) {
    Renderer.drawCourt(ctx, 0, 0, WIDTH, HEIGHT)
    Renderer.drawAnnouncementText(ctx, 'Aguardando jogadores...')
  }

  destroy() {}
}

class RematchStage implements Stage {
  private winnerName: string

  constructor(winnerName: string) {
    this.winnerName = winnerName
  }

  update(dt: number) {}

  draw(ctx: CanvasRenderingContext2D) {
    Renderer.drawCourt(ctx, 0, 0, WIDTH, HEIGHT)
    Renderer.drawAnnouncementText(ctx, `Jogador ${this.winnerName} venceu!`)
  }

  setWinnerName(winnerName: string) {
    this.winnerName = winnerName
  }

  destroy() {}
}

interface Target {
  x: number
  y: number
  speed: number
}

class PlayingStage implements Stage {
  private pad1: Pad
  private pad2: Pad
  private ball: Ball
  private playerControlsEnabled: boolean
  private canvas: HTMLCanvasElement
  private onPadMove: (x: number) => void

  constructor(canvas: HTMLCanvasElement, onPadMove: (x: number) => void) {
    this.pad1 = new Pad(WIDTH / 2 - PAD_WIDTH / 2, PAD1_OFFSET_Y, PAD_WIDTH, PAD_HEIGHT)
    this.pad2 = new Pad(WIDTH / 2 - PAD_WIDTH / 2, PAD2_OFFSET_Y, PAD_WIDTH, PAD_HEIGHT)
    this.ball = new Ball(WIDTH / 2, HEIGHT / 2, BALL_RADIUS)
    this.playerControlsEnabled = false
    this.canvas = canvas
    this.onPadMove = onPadMove
  }

  update(dt: number) {
    this.pad1.update(dt)
    this.pad2.update(dt)

    const newPosition = {
      x: this.ball.getPosition().x + this.ball.getDirection()[0] * this.ball.getSpeed() * dt,
      y: this.ball.getPosition().y + this.ball.getDirection()[1] * this.ball.getSpeed() * dt
    }

    if (newPosition.x - BALL_RADIUS < 0) {
      newPosition.x = BALL_RADIUS
    }

    if (newPosition.x + BALL_RADIUS > WIDTH) {
      newPosition.x = WIDTH - BALL_RADIUS
    }

    if (this.checkPadCollision(newPosition.x, newPosition.y, this.pad1)) {
      newPosition.y = this.pad1.getPosition().y + PAD_HEIGHT + BALL_RADIUS
      this.ball.setDirection(this.getBallDirection(this.pad1, newPosition))
    }

    if (this.checkPadCollision(newPosition.x, newPosition.y, this.pad2)) {
      newPosition.y = this.pad2.getPosition().y - BALL_RADIUS
      this.ball.setDirection(this.getBallDirection(this.pad2, newPosition))
    }

    this.ball.setPosition(newPosition.x, newPosition.y)
  }

  reset() {
    this.ball.setPosition(WIDTH / 2, HEIGHT / 2)
    this.ball.setDirection([0, 0])
    this.ball.setSpeed(BALL_START_SPEED)
  }

  checkPadCollision(x: number, y: number, pad: Pad) {
    return (
      x >= pad.getPosition().x &&
      x <= pad.getPosition().x + PAD_WIDTH &&
      y >= pad.getPosition().y &&
      y <= pad.getPosition().y + PAD_HEIGHT
    )
  }

  getBallDirection(pad: Pad, newBallPos: { x: number; y: number }) {
    let dx = ((newBallPos.x - pad.getPosition().x) / PAD_WIDTH) * 2 - 1

    if (dx < -1) {
      dx = -1
    }

    if (dx > 1) {
      dx = 1
    }

    const angle = 45 * dx - 90
    const dy = pad.getPosition().y < HEIGHT / 2 ? -1 : 1

    return [Math.cos((angle * Math.PI) / 180), dy * Math.sin((angle * Math.PI) / 180)]
  }

  draw(ctx: CanvasRenderingContext2D) {
    Renderer.drawCourt(ctx, 0, 0, WIDTH, HEIGHT)

    this.pad1.draw(ctx)
    this.pad2.draw(ctx)
    this.ball.draw(ctx)
  }

  destroy() {}

  updateBallData(x: number, y: number, direction: number[], speed: number) {
    this.ball.setPosition(x, y)
    this.ball.setDirection(direction)
    this.ball.setSpeed(speed)
  }

  setPadPosition(padIndex: number, x: number) {
    if (padIndex === 1) {
      this.pad1.setTargetPosition(x, this.pad1.getPosition().y)
    } else {
      this.pad2.setTargetPosition(x, this.pad2.getPosition().y)
    }
  }

  enablePlayerControls(enabled: boolean) {
    this.playerControlsEnabled = enabled

    if (enabled) {
      this.setupPlayerControls()
      this.pad1.setInterpolatePosition(true)
    } else {
      this.teardownPlayerControls()
      this.pad1.setInterpolatePosition(false)
    }
  }

  setupPlayerControls() {
    window.addEventListener('mousemove', this.handleMouseMove.bind(this))
  }

  teardownPlayerControls() {
    window.removeEventListener('mousemove', this.handleMouseMove.bind(this))
  }

  handleMouseMove(event: MouseEvent) {
    if (!this.playerControlsEnabled) {
      return
    }

    let x = event.clientX - this.canvas.offsetLeft

    if (x < 0) {
      x = 0
    }

    if (x + PAD_WIDTH > WIDTH) {
      x = WIDTH - PAD_WIDTH
    }

    this.pad2.setPosition(x, this.pad2.getPosition().y)
    this.onPadMove(x)
  }
}

class TennisGame {
  private root: HTMLElement
  private canvas?: HTMLCanvasElement
  private ctx?: CanvasRenderingContext2D
  private surfaceCanvas?: HTMLCanvasElement
  private surfaceCtx?: CanvasRenderingContext2D
  private lastTime: number = 0
  private stage?: Stage
  private onPadMove: (x: number) => void
  private onUpdate: (dt: number) => void
  private isRunning: boolean = true
  private hitSound: HTMLAudioElement
  private mainloopInterval?: NodeJS.Timeout

  constructor(root: HTMLElement, onPadMove: (x: number) => void, onUpdate: (dt: number) => void) {
    this.root = root
    this.onPadMove = onPadMove
    this.onUpdate = onUpdate
    this.hitSound = new Audio('resources/hit.mp3')
  }

  init() {
    this.canvas = this.createCanvas()
    const ctx = this.canvas.getContext('2d')

    if (!ctx) {
      throw new Error('Failed to get canvas context')
    }

    this.ctx = ctx

    this.surfaceCanvas = this.createCanvas()
    const surfaceCtx = this.surfaceCanvas.getContext('2d')

    if (!surfaceCtx) {
      throw new Error('Failed to get surface canvas context')
    }

    this.surfaceCtx = surfaceCtx

    this.ctx.imageSmoothingEnabled = false
    this.surfaceCtx.imageSmoothingEnabled = false

    this.root.appendChild(this.canvas)
  }

  start() {
    this.mainloopInterval = setInterval(() => {
      this.mainloop()
    }, 1000 / 60)
  }

  setStage(stage: StageType) {
    this.stage?.destroy?.()

    switch (stage) {
      case StageType.WAITING_FOR_PLAYERS:
        this.stage = new WaitingForPlayersStage()
        break
      case StageType.PLAYING:
        this.stage = new PlayingStage(this.canvas!, this.onPadMove)
        break
      case StageType.WAITING_FOR_REMATCH:
        this.stage = new RematchStage('')
        break
    }
  }

  updateBallData(x: number, y: number, direction: number[], speed: number) {
    if (this.stage instanceof PlayingStage) {
      this.stage.updateBallData(x, y, direction, speed)
    }
  }

  setPadPosition(padIndex: number, x: number) {
    if (this.stage instanceof PlayingStage) {
      this.stage.setPadPosition(padIndex, x)
    }
  }

  setWinnerName(winnerName: string) {
    if (this.stage instanceof RematchStage) {
      this.stage.setWinnerName(winnerName)
    }
  }

  enablePlayerControls(enabled: boolean) {
    if (this.stage instanceof PlayingStage) {
      this.stage.enablePlayerControls(enabled)
    }
  }

  playHitSound() {
    this.hitSound.currentTime = 0
    this.hitSound.play()
  }

  reset() {
    if (this.stage instanceof PlayingStage) {
      this.stage.reset()
    }
  }

  destroy() {
    this.root.removeChild(this.canvas!)
    this.canvas = undefined
    this.ctx = undefined
    this.surfaceCanvas = undefined
    this.surfaceCtx = undefined
    this.stage?.destroy?.()
    this.stage = undefined
    this.isRunning = false

    clearInterval(this.mainloopInterval!)
  }

  private update(dt: number) {
    if (!this.isRunning) {
      return
    }

    if (!this.canvas || !this.surfaceCanvas || !this.ctx || !this.surfaceCtx) {
      return
    }

    this.surfaceCtx.fillStyle = 'black'
    this.surfaceCtx.fillRect(0, 0, WIDTH, HEIGHT)

    this.stage?.update(dt)
    this.stage?.draw(this.surfaceCtx)

    this.ctx.fillStyle = 'black'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    this.ctx.drawImage(this.surfaceCanvas, 0, 0, this.canvas.width, this.canvas.height)
  }

  private mainloop() {
    const dt = 1 / 60

    this.update(dt)
    this.onUpdate(dt)
  }

  private getDeltaTime() {
    const now = Date.now()
    const dt = now - this.lastTime

    this.lastTime = now

    return dt
  }

  private createCanvas() {
    const canvas = document.createElement('canvas')

    canvas.width = this.root.clientWidth
    canvas.height = this.root.clientHeight

    return canvas
  }
}

export {
  TennisGame,
  StageType,
  WIDTH,
  HEIGHT,
  PAD_WIDTH,
  PAD_HEIGHT,
  PAD1_OFFSET_Y,
  PAD2_OFFSET_Y,
  BALL_RADIUS
}
