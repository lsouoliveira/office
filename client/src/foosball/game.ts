const WIDTH = 896
const HEIGHT = 480
const COURT_BORDER_WIDTH = 20
const OUTSIDE_BORDER_WIDTH = 0
const PAD_WIDTH = 80
const PAD_HEIGHT = 12
const PAD1_OFFSET_Y = OUTSIDE_BORDER_WIDTH + 10
const PAD2_OFFSET_Y = HEIGHT - OUTSIDE_BORDER_WIDTH - PAD_HEIGHT - 10
const BALL_RADIUS = 8
const BALL_START_SPEED = 350
const PAD_INTERPOLATION_SPEED = 25
const GOAL_HEIGHT = 240
const FIELD_HEIGHT = HEIGHT - COURT_BORDER_WIDTH * 2
const FIELD_WIDTH = WIDTH - COURT_BORDER_WIDTH * 2
const CENTER_CIRCLE_RADIUS = (9.15 / 90) * HEIGHT
const CORNER_CIRCLE_RADIUS = (5 / 90) * HEIGHT
const GOAL_AREA_HEIGHT = GOAL_HEIGHT
const GOAL_AREA_WIDTH = 60
const PENALTY_AREA_HEIGHT = GOAL_HEIGHT + 60
const PENALTY_AREA_WIDTH = 100
const PENALTY_AREA_CIRCLE_RADIUS = (16 / 90) * HEIGHT
const STICK_WIDTH = 10
const STICK_HEIGHT = 2 * HEIGHT
const STICK_PADDING_X = 30
const STICK_GAP = (FIELD_WIDTH - 2 * STICK_PADDING_X) / 8
const STICK_POINT_GAP = 60
const STICK_POINT_WIDTH = 20
const STICK_POINT_HEIGHT = 40

enum StageType {
  WAITING_FOR_PLAYERS,
  PLAYING,
  WAITING_FOR_REMATCH,
  COUNTDOWN
}

enum Color {
  BLUE = 'blue',
  RED = 'red'
}

interface Stage {
  update: (dt: number) => void
  draw: (ctx: CanvasRenderingContext2D) => void
  destroy?: () => void
}

interface Point {
  x: number
  y: number
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

    ctx.fillStyle = '#2ca01b'
    ctx.fillRect(offsetX, offsetY, innerWidth, innerHeight)

    const fieldWidth = innerWidth - COURT_BORDER_WIDTH * 2
    const fieldHeight = innerHeight - COURT_BORDER_WIDTH * 2
    const fieldOffsetX = offsetX + COURT_BORDER_WIDTH
    const fieldOffsetY = offsetY + COURT_BORDER_WIDTH

    // inner border
    ctx.beginPath()
    ctx.strokeStyle = 'white'
    ctx.lineWidth = 2
    ctx.strokeRect(fieldOffsetX, fieldOffsetY, fieldWidth, fieldHeight)
    ctx.stroke()
    ctx.closePath()

    // center line
    ctx.beginPath()
    ctx.strokeStyle = 'white'
    ctx.lineWidth = 2
    ctx.moveTo(fieldOffsetX + fieldWidth / 2, fieldOffsetY)
    ctx.lineTo(fieldOffsetX + fieldWidth / 2, fieldOffsetY + fieldHeight)
    ctx.stroke()
    ctx.closePath()

    // center circle
    ctx.beginPath()
    ctx.fillStyle = 'white'
    ctx.arc(
      fieldOffsetX + fieldWidth / 2,
      fieldOffsetY + fieldHeight / 2,
      CENTER_CIRCLE_RADIUS,
      0,
      Math.PI * 2
    )
    ctx.stroke()
    ctx.closePath()

    // corner circles
    ctx.beginPath()
    ctx.strokeStyle = 'white'
    ctx.lineWidth = 2
    ctx.arc(fieldOffsetX, fieldOffsetY, CORNER_CIRCLE_RADIUS, 0, Math.PI / 2)
    ctx.stroke()
    ctx.closePath()

    ctx.beginPath()
    ctx.strokeStyle = 'white'
    ctx.lineWidth = 2
    ctx.arc(fieldOffsetX + fieldWidth, fieldOffsetY, CORNER_CIRCLE_RADIUS, Math.PI / 2, Math.PI)
    ctx.stroke()
    ctx.closePath()

    ctx.beginPath()
    ctx.strokeStyle = 'white'
    ctx.lineWidth = 2
    ctx.arc(
      fieldOffsetX,
      fieldOffsetY + fieldHeight,
      CORNER_CIRCLE_RADIUS,
      (3 * Math.PI) / 2,
      Math.PI * 2
    )
    ctx.stroke()
    ctx.closePath()

    ctx.beginPath()
    ctx.strokeStyle = 'white'
    ctx.lineWidth = 2
    ctx.arc(
      fieldOffsetX + fieldWidth,
      fieldOffsetY + fieldHeight,
      CORNER_CIRCLE_RADIUS,
      Math.PI,
      (3 * Math.PI) / 2
    )
    ctx.stroke()
    ctx.closePath()

    // goal area
    ctx.beginPath()
    ctx.strokeStyle = 'white'
    ctx.lineWidth = 2
    ctx.strokeRect(
      fieldOffsetX,
      fieldOffsetY + (fieldHeight - GOAL_AREA_HEIGHT) / 2,
      GOAL_AREA_WIDTH,
      GOAL_AREA_HEIGHT
    )
    ctx.stroke()
    ctx.closePath()

    ctx.beginPath()
    ctx.strokeStyle = 'white'
    ctx.lineWidth = 2
    ctx.strokeRect(
      fieldOffsetX + fieldWidth - GOAL_AREA_WIDTH,
      fieldOffsetY + (fieldHeight - GOAL_AREA_HEIGHT) / 2,
      GOAL_AREA_WIDTH,
      GOAL_AREA_HEIGHT
    )
    ctx.stroke()
    ctx.closePath()

    // penalty area
    ctx.beginPath()
    ctx.strokeStyle = 'white'
    ctx.lineWidth = 2
    ctx.strokeRect(
      fieldOffsetX,
      fieldOffsetY + (fieldHeight - PENALTY_AREA_HEIGHT) / 2,
      PENALTY_AREA_WIDTH,
      PENALTY_AREA_HEIGHT
    )
    ctx.stroke()
    ctx.closePath()

    ctx.beginPath()
    ctx.strokeStyle = 'white'
    ctx.lineWidth = 2
    ctx.strokeRect(
      fieldOffsetX + fieldWidth - PENALTY_AREA_WIDTH,
      fieldOffsetY + (fieldHeight - PENALTY_AREA_HEIGHT) / 2,
      PENALTY_AREA_WIDTH,
      PENALTY_AREA_HEIGHT
    )
    ctx.stroke()
    ctx.closePath()

    // penalty area circles
    ctx.beginPath()
    ctx.strokeStyle = 'white'
    ctx.lineWidth = 2
    ctx.arc(
      fieldOffsetX + GOAL_AREA_WIDTH - 20,
      fieldOffsetY + fieldHeight / 2,
      PENALTY_AREA_CIRCLE_RADIUS,
      Math.PI * -0.25,
      Math.PI * 0.25
    )
    ctx.stroke()
    ctx.closePath()

    ctx.beginPath()
    ctx.strokeStyle = 'white'
    ctx.lineWidth = 2
    ctx.arc(
      fieldOffsetX + fieldWidth - GOAL_AREA_WIDTH + 20,
      fieldOffsetY + fieldHeight / 2,
      PENALTY_AREA_CIRCLE_RADIUS,
      Math.PI * 0.75,
      Math.PI * 1.25
    )
    ctx.stroke()
    ctx.closePath()
  }

  static drawFieldBorders(ctx: CanvasRenderingContext2D) {
    const offsetX = -2
    const offsetY = -2
    const innerWidth = WIDTH + 3
    const innerHeight = HEIGHT + 3

    // top border
    ctx.fillStyle = 'black'
    ctx.fillRect(offsetX, offsetY, innerWidth, COURT_BORDER_WIDTH)

    // bottom border
    ctx.fillStyle = 'black'
    ctx.fillRect(
      offsetX,
      offsetY + innerHeight - COURT_BORDER_WIDTH,
      innerWidth,
      COURT_BORDER_WIDTH
    )

    const SIDE_BORDER_HEIGHT = (innerHeight - GOAL_HEIGHT) / 2

    // left border
    ctx.fillStyle = 'black'
    ctx.fillRect(offsetX, offsetY, COURT_BORDER_WIDTH, SIDE_BORDER_HEIGHT)

    ctx.fillStyle = 'black'
    ctx.fillRect(
      offsetX,
      offsetY + innerHeight - SIDE_BORDER_HEIGHT,
      COURT_BORDER_WIDTH,
      SIDE_BORDER_HEIGHT
    )

    // right border
    ctx.fillStyle = 'black'
    ctx.fillRect(
      offsetX + innerWidth - COURT_BORDER_WIDTH,
      offsetY,
      COURT_BORDER_WIDTH,
      SIDE_BORDER_HEIGHT
    )

    ctx.fillStyle = 'black'
    ctx.fillRect(
      offsetX + innerWidth - COURT_BORDER_WIDTH,
      offsetY + innerHeight - SIDE_BORDER_HEIGHT,
      COURT_BORDER_WIDTH,
      SIDE_BORDER_HEIGHT
    )
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

class Stick {
  private x: number
  private y: number
  private color: Color
  private player: Player
  private contactPoints: Point[]

  constructor(color: Color, player: Player) {
    this.x = 0
    this.y = 0
    this.color = color
    this.player = player
    this.contactPoints = []
  }

  getPosition() {
    return { x: this.x, y: this.y }
  }

  setPosition(x: number, y: number) {
    this.x = x
    this.y = y
  }

  update(dt: number) {}

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'white'
    ctx.fillRect(
      this.player.getPosition().x + this.x,
      this.player.getPosition().y + this.y + this.player.getHeight() / 2 - STICK_HEIGHT / 2,
      STICK_WIDTH,
      STICK_HEIGHT
    )

    ctx.beginPath()
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 1
    ctx.strokeRect(
      this.player.getPosition().x + this.x,
      this.player.getPosition().y + this.y + this.player.getHeight() / 2 - STICK_HEIGHT / 2,
      STICK_WIDTH,
      STICK_HEIGHT
    )
    ctx.closePath()

    const offsetX = this.player.getPosition().x + this.x + STICK_WIDTH / 2
    const offsetY = this.player.getPosition().y + this.y + this.player.getHeight() / 2

    ctx.fillStyle = this.color

    for (const contactPoint of this.contactPoints) {
      ctx.beginPath()
      ctx.roundRect(
        offsetX - STICK_POINT_WIDTH / 2,
        offsetY - STICK_POINT_HEIGHT / 2 + contactPoint.y,
        STICK_POINT_WIDTH,
        STICK_POINT_HEIGHT,
        5
      )
      ctx.fill()
      ctx.closePath()

      ctx.beginPath()
      ctx.strokeStyle = 'black'
      ctx.lineWidth = 1
      ctx.roundRect(
        offsetX - STICK_POINT_WIDTH / 2,
        offsetY - STICK_POINT_WIDTH + contactPoint.y,
        STICK_POINT_WIDTH,
        STICK_POINT_HEIGHT,
        5
      )
      ctx.stroke()
      ctx.closePath()
    }
  }

  addContactPoint(x: number, y: number) {
    this.contactPoints.push({ x, y })
  }
}

class Player {
  private x: number
  private y: number
  private height: number
  private sticks: Stick[]

  constructor(height: number) {
    this.x = 0
    this.y = 0
    this.sticks = []
    this.height = height
  }

  update(dt: number) {
    this.sticks.forEach((stick, index) => {
      stick.update(dt)
    })
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.sticks.forEach((stick) => {
      stick.draw(ctx)
    })
  }

  addStick(stick: Stick) {
    this.sticks.push(stick)
  }

  getPosition() {
    return { x: this.x, y: this.y }
  }

  setPosition(x: number, y: number) {
    this.x = x
    this.y = y
  }

  getHeight() {
    return this.height
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
    Renderer.drawFieldBorders(ctx)
    // Renderer.drawAnnouncementText(ctx, 'Aguardando jogadores...')
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
  private ball: Ball
  private playerControlsEnabled: boolean
  private canvas: HTMLCanvasElement
  private player1: Player
  private player2: Player

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas

    this.player1 = new Player(HEIGHT - COURT_BORDER_WIDTH * 2)

    const stick1 = new Stick(Color.BLUE, this.player1)
    stick1.addContactPoint(0, 0)

    stick1.setPosition(STICK_PADDING_X, 0)

    const stick2 = new Stick(Color.BLUE, this.player1)
    stick2.addContactPoint(0, -STICK_POINT_HEIGHT - STICK_POINT_GAP)
    stick2.addContactPoint(0, STICK_POINT_HEIGHT + STICK_POINT_GAP)

    stick2.setPosition(STICK_PADDING_X + STICK_GAP, 0)

    const stick3 = new Stick(Color.BLUE, this.player1)
    stick3.addContactPoint(0, -STICK_POINT_HEIGHT / 2 - STICK_POINT_GAP / 2)
    stick3.addContactPoint(0, STICK_POINT_HEIGHT / 2 + STICK_POINT_GAP / 2)
    stick3.addContactPoint(0, 1.5 * STICK_POINT_HEIGHT + 1.5 * STICK_POINT_GAP)
    stick3.addContactPoint(0, -1.5 * STICK_POINT_HEIGHT - 1.5 * STICK_POINT_GAP)

    stick3.setPosition(STICK_PADDING_X + 3 * STICK_GAP, 0)

    const stick4 = new Stick(Color.BLUE, this.player1)
    stick4.addContactPoint(0, 0)
    stick4.addContactPoint(0, -STICK_POINT_HEIGHT - STICK_POINT_GAP)
    stick4.addContactPoint(0, STICK_POINT_HEIGHT + STICK_POINT_GAP)

    stick4.setPosition(STICK_PADDING_X + 5 * STICK_GAP, 0)

    this.player1.addStick(stick1)
    this.player1.addStick(stick2)
    this.player1.addStick(stick3)
    this.player1.addStick(stick4)

    this.player1.setPosition(COURT_BORDER_WIDTH, COURT_BORDER_WIDTH)

    this.player2 = new Player(HEIGHT - COURT_BORDER_WIDTH * 2)

    const player2_stick1 = new Stick(Color.RED, this.player2)
    player2_stick1.addContactPoint(0, 0)

    player2_stick1.setPosition(STICK_PADDING_X + 7 * STICK_GAP, 0)

    const player2_stick2 = new Stick(Color.RED, this.player2)
    player2_stick2.addContactPoint(0, -STICK_POINT_HEIGHT - STICK_POINT_GAP)
    player2_stick2.addContactPoint(0, STICK_POINT_HEIGHT + STICK_POINT_GAP)

    player2_stick2.setPosition(STICK_PADDING_X + 6 * STICK_GAP, 0)

    const player2_stick3 = new Stick(Color.RED, this.player2)
    player2_stick3.addContactPoint(0, -STICK_POINT_HEIGHT / 2 - STICK_POINT_GAP / 2)
    player2_stick3.addContactPoint(0, STICK_POINT_HEIGHT / 2 + STICK_POINT_GAP / 2)
    player2_stick3.addContactPoint(0, 1.5 * STICK_POINT_HEIGHT + 1.5 * STICK_POINT_GAP)
    player2_stick3.addContactPoint(0, -1.5 * STICK_POINT_HEIGHT - 1.5 * STICK_POINT_GAP)

    player2_stick3.setPosition(STICK_PADDING_X + 4 * STICK_GAP, 0)

    const player2_stick4 = new Stick(Color.RED, this.player2)
    player2_stick4.addContactPoint(0, 0)
    player2_stick4.addContactPoint(0, -STICK_POINT_HEIGHT - STICK_POINT_GAP)
    player2_stick4.addContactPoint(0, STICK_POINT_HEIGHT + STICK_POINT_GAP)

    player2_stick4.setPosition(STICK_PADDING_X + 2 * STICK_GAP, 0)

    this.player2.addStick(player2_stick1)
    this.player2.addStick(player2_stick2)
    this.player2.addStick(player2_stick3)
    this.player2.addStick(player2_stick4)

    this.player2.setPosition(COURT_BORDER_WIDTH, COURT_BORDER_WIDTH)
  }

  update(dt: number) {
    this.player1.update(dt)
    this.player2.update(dt)
  }

  reset() {}

  draw(ctx: CanvasRenderingContext2D) {
    Renderer.drawCourt(ctx, 0, 0, WIDTH, HEIGHT)
    this.player1.draw(ctx)
    this.player2.draw(ctx)
    Renderer.drawFieldBorders(ctx)
  }

  destroy() {}
}

class FoosballGame {
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
    this.setStage(StageType.PLAYING)
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
        this.stage = new PlayingStage(this.canvas!)
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
  FoosballGame,
  StageType,
  WIDTH,
  HEIGHT,
  PAD_WIDTH,
  PAD_HEIGHT,
  PAD1_OFFSET_Y,
  PAD2_OFFSET_Y,
  BALL_RADIUS
}
