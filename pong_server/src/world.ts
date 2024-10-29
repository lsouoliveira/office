import { Server } from 'socket.io'
import logger from './logger'
import * as crypto from 'crypto'

const TICK_RATE = 1.0 / 60.0
const GAME_WIDTH = 480
const GAME_HEIGHT = 640
const PAD_WIDTH = 80
const PAD_HEIGHT = 12
const BALL_START_SPEED = 250
const BALL_SPEED = 500
const BALL_SPEED_INCREASE = 10
const BALL_RADIUS = 8
const MAX_SCORE = 5
const PAD_OFFSET_Y = 10

interface User {
  id?: string
  username: string
  isConnected: boolean
}

interface CustomSocket extends SocketIO.Socket {
  userId: string
}

class UserStore {
  private users: User[]

  constructor() {
    this.users = []
  }

  save(user: User) {
    const filteredUsers = this.users.filter((u) => u.id !== user.id)

    this.users = [...filteredUsers, user]
  }

  findById(id: string) {
    const foundUser = this.users.find((u) => u.id === id)

    if (!foundUser) {
      return null
    }

    return { ...foundUser }
  }

  findAll() {
    return [...this.users]
  }
}

class Pad {
  private userId: string
  private x: number
  private y: number
  private _isReady: boolean

  constructor(userId: string) {
    this.userId = userId
    this.x = 0
    this.y = 0
    this._isReady = false
  }

  getPos() {
    return { x: this.x, y: this.y }
  }

  setPos(x: number, y: number) {
    this.x = x
    this.y = y
  }

  getUserId() {
    return this.userId
  }

  isReady() {
    return this._isReady
  }

  setReady(ready: boolean) {
    this._isReady = ready
  }

  serialize() {
    return {
      userId: this.userId,
      x: this.x,
      y: this.y
    }
  }
}

class Ball {
  private x: number
  private y: number
  private speed: number
  private direction: number[]

  constructor() {
    this.x = 0
    this.y = 0
    this.direction = [0, 0]
  }
  setPos(x: number, y: number) {
    this.x = x
    this.y = y
  }

  getPos() {
    return { x: this.x, y: this.y }
  }

  getSpeed() {
    return this.speed
  }

  setSpeed(speed: number) {
    this.speed = speed
  }

  getDirection() {
    return this.direction
  }

  setDirection(x: number, y: number) {
    this.direction = [x, y]
  }

  serialize() {
    return {
      x: this.x,
      y: this.y,
      direction: this.direction,
      speed: this.speed
    }
  }
}

enum GameState {
  WAITING_FOR_PLAYERS,
  PLAYING,
  WAITING_FOR_REMATCH
}

class World {
  private io: Server
  private pad1?: Pad
  private pad2?: Pad
  private state: GameState
  private users: UserStore
  private ball: Ball
  private turn: number
  private score: number[] = [0, 0]

  constructor(io: Server) {
    this.io = io
    this.state = GameState.WAITING_FOR_PLAYERS
    this.users = new UserStore()
    this.ball = new Ball()
  }

  init() {
    this.io.use(async (socket, next) => {
      const { userId, username } = socket.handshake.auth

      const user = this.users.findById(userId)

      if (user) {
        socket.userId = userId
        user.isConnected = true

        this.users.save(user)

        logger.info(`User ${user.username} reconnected`)

        return next()
      }

      logger.error(`User ${username} not found`)

      if (!username) {
        return next(new Error('Invalid username'))
      }

      const newUser = {
        id: crypto.randomUUID(),
        username,
        isConnected: true
      } as User

      this.users.save(newUser)

      socket.userId = newUser.id

      logger.info(`User ${username} connected`)

      next()
    })

    this.io.on('connection', (socket) => {
      const user = this.users.findById(socket.userId)

      socket.emit('session', { userId: socket.userId })
      socket.emit('room', this.getRoomState())

      socket.broadcast.emit('user:connected', user)

      socket.on('game:join', this.handleJoinGame.bind(this, socket))
      socket.on('game:move', this.handlePadMove.bind(this, socket))
      socket.on('game:rematch', this.handleRematch.bind(this, socket))
      socket.on('user:message', this.handleUserMessage.bind(this, socket))
      socket.on('disconnect', this.handleDisconnect.bind(this, socket))
    })
  }

  mainloop(dt: number) {
    if (this.state !== GameState.PLAYING) {
      return
    }

    this.update(dt)
  }

  update(dt: number) {
    if (this.state !== GameState.PLAYING) {
      return
    }

    const newBallPos = {
      x: this.ball.getPos().x + this.ball.getDirection()[0] * this.ball.getSpeed() * dt,
      y: this.ball.getPos().y + this.ball.getDirection()[1] * this.ball.getSpeed() * dt
    }

    let wallCollision = false

    if (newBallPos.x - BALL_RADIUS < 0 || newBallPos.x + BALL_RADIUS > GAME_WIDTH) {
      this.ball.setDirection(-this.ball.getDirection()[0], this.ball.getDirection()[1])

      if (newBallPos.x - BALL_RADIUS < 0) {
        newBallPos.x = BALL_RADIUS
      } else {
        newBallPos.x = GAME_WIDTH - BALL_RADIUS
      }

      wallCollision = true
    }

    let checkPadCollision = false

    if (this.pad1 && this.checkPadCollision(this.pad1, newBallPos)) {
      const newDirection = this.getBallDirection(this.pad1, newBallPos)

      this.ball.setDirection(newDirection[0], newDirection[1])
      newBallPos.y = this.pad1.getPos().y + PAD_HEIGHT + BALL_RADIUS

      checkPadCollision = true
    }

    if (this.pad2 && this.checkPadCollision(this.pad2, newBallPos)) {
      const newDirection = this.getBallDirection(this.pad2, newBallPos)

      this.ball.setDirection(newDirection[0], newDirection[1])
      newBallPos.y = this.pad2.getPos().y - BALL_RADIUS

      checkPadCollision = true
    }

    if (checkPadCollision) {
      if (this.ball.getSpeed() < BALL_SPEED) {
        this.ball.setSpeed(BALL_SPEED)
      } else {
        this.ball.setSpeed(this.ball.getSpeed() + BALL_SPEED_INCREASE)
      }
    }

    if (wallCollision || checkPadCollision) {
      this.io.emit('game:hit')
    }

    if (this.canScore()) {
      if (this.canPad1Score()) {
        this.score[0]++
      }

      if (this.canPad2Score()) {
        this.score[1]++
      }

      this.nextTurn()

      return
    } else {
      this.ball.setPos(newBallPos.x, newBallPos.y)
    }

    this.io.emit('game:state', this.getGameState())
  }

  getBallDirection(pad: Pad, newBallPos: { x: number; y: number }) {
    let dx = ((newBallPos.x - pad.getPos().x) / PAD_WIDTH) * 2 - 1

    if (dx < -1) {
      dx = -1
    }

    if (dx > 1) {
      dx = 1
    }

    const angle = 45 * dx - 90
    const dy = pad.getPos().y < GAME_HEIGHT / 2 ? -1 : 1

    return [Math.cos((angle * Math.PI) / 180), dy * Math.sin((angle * Math.PI) / 180)]
  }

  checkPadCollision(pad: Pad | undefined, newBallPos: { x: number; y: number }) {
    if (!pad) {
      return false
    }

    return (
      newBallPos.y - BALL_RADIUS < pad.getPos().y + PAD_HEIGHT &&
      newBallPos.y + BALL_RADIUS > pad.getPos().y &&
      newBallPos.x - BALL_RADIUS < pad.getPos().x + PAD_WIDTH &&
      newBallPos.x + BALL_RADIUS > pad.getPos().x
    )
  }

  canScore() {
    return (
      this.ball.getPos().y - BALL_RADIUS < 0 || this.ball.getPos().y + BALL_RADIUS > GAME_HEIGHT
    )
  }

  canPad1Score() {
    return this.ball.getPos().y + BALL_RADIUS > GAME_HEIGHT
  }

  canPad2Score() {
    return this.ball.getPos().y - BALL_RADIUS < 0
  }

  nextTurn() {
    if (this.score[0] >= MAX_SCORE || this.score[1] >= MAX_SCORE) {
      this.state = GameState.WAITING_FOR_REMATCH

      this.pad1?.setReady(false)
      this.pad2?.setReady(false)
      this.resetGame()

      this.io.emit('room', this.getRoomState())

      return false
    }

    this.turn = this.turn === 0 ? 1 : 0

    this.setBallDirection()
    this.ball.setPos(GAME_WIDTH / 2, GAME_HEIGHT / 2)
    this.ball.setSpeed(BALL_START_SPEED)
    this.io.emit('game:nextTurn', this.getGameState())

    return true
  }

  start() {
    this.init()

    setInterval(() => {
      this.mainloop(TICK_RATE)
    }, TICK_RATE * 1000)
  }

  private async handleSelectPad1(socket: CustomSocket) {
    const user = this.users.findById(socket.userId)

    if (!user) {
      return
    }

    if (this.pad1) {
      return
    }

    this.pad1 = new Pad(socket.userId)
    this.pad1.setReady(true)

    this.handlePadSelected()

    logger.info(`Pad 1 selected by user ${user.username}`)
  }

  private async handleSelectPad2(socket: CustomSocket) {
    const user = this.users.findById(socket.userId)

    if (!user) {
      return
    }

    if (this.pad2) {
      return
    }

    this.pad2 = new Pad(socket.userId)
    this.pad2.setReady(true)

    this.handlePadSelected()

    logger.info(`Pad 2 selected by user ${user.username}`)
  }

  private handlePadSelected() {
    if (this.pad1 && this.pad2) {
      this.startMatch()
    }
  }

  private resetGame() {
    this.turn = Math.floor(Math.random() * 2)
    this.pad1?.setPos(GAME_WIDTH / 2, PAD_OFFSET_Y)
    this.pad2?.setPos(GAME_WIDTH / 2, GAME_HEIGHT - PAD_HEIGHT - PAD_OFFSET_Y)
    this.ball.setPos(GAME_WIDTH / 2, GAME_HEIGHT / 2)
    this.ball.setSpeed(BALL_START_SPEED)
    this.setBallDirection()
  }

  private startMatch() {
    this.resetGame()
    this.score = [0, 0]
    this.state = GameState.PLAYING

    this.io.emit('room', this.getRoomState())
  }

  private setBallDirection() {
    const random = 1
    let directionX = 0

    if (random < 0.33) {
      directionX = -1
    } else if (random < 0.66) {
      directionX = 1
    } else {
      directionX = 0
    }

    if (this.turn === 0) {
      this.ball.setDirection(directionX, -1)
      return
    }

    this.ball.setDirection(directionX, 1)
  }

  private getRoomState() {
    return {
      state: this.state,
      pad1: this.pad1?.serialize(),
      pad2: this.pad2?.serialize(),
      users: this.users.findAll(),
      score: this.score
    }
  }

  private async handleJoinGame(socket: CustomSocket) {
    const user = this.users.findById(socket.userId)

    if (!user) {
      return
    }

    if (!this.pad1) {
      this.handleSelectPad1(socket)
    } else if (!this.pad2) {
      this.handleSelectPad2(socket)
    }

    this.io.emit('room', this.getRoomState())
  }

  private async handlePadMove(socket: CustomSocket, data: { userId: string; x: number }) {
    const user = this.users.findById(socket.userId)

    if (!user) {
      return
    }

    const pad = this.getPadByUserId(socket.userId)

    if (!pad) {
      return
    }

    const padPosChanged = Math.abs(pad.getPos().x - data.x) > 0

    if (!padPosChanged) {
      return
    }

    pad.setPos(data.x, pad.getPos().y)
  }

  private async handleRematch(socket: CustomSocket) {
    if (this.state !== GameState.WAITING_FOR_REMATCH) {
      return
    }

    const user = this.users.findById(socket.userId)

    if (!user) {
      return
    }

    const pad = this.getPadByUserId(socket.userId)

    if (!pad) {
      return
    }

    pad.setReady(true)

    if (this.pad1?.isReady() && this.pad2?.isReady()) {
      this.startMatch()
    }
  }

  private async handleUserMessage(socket: CustomSocket, data: { message: string }) {
    const user = this.users.findById(socket.userId)

    if (!user) {
      return
    }

    this.io.emit('user:message', {
      id: crypto.randomUUID(),
      username: user.username,
      message: data.message,
      created_at: new Date()
    })
  }

  private getPadByUserId(userId: string) {
    if (this.pad1?.getUserId() === userId) {
      return this.pad1
    }

    if (this.pad2?.getUserId() === userId) {
      return this.pad2
    }

    return null
  }

  private async handleDisconnect(socket: CustomSocket) {
    const user = this.users.findById(socket.userId)

    if (!user) {
      return
    }

    this.updateUser({ id: socket.userId, isConnected: false })

    socket.broadcast.emit('user:disconnected', user)

    if (this.pad1?.getUserId() === socket.userId) {
      this.pad1 = undefined

      this.handlePadDisconnected(socket)
    } else if (this.pad2?.getUserId() === socket.userId) {
      this.pad2 = undefined

      this.handlePadDisconnected(socket)
    }
  }

  private handlePadDisconnected(socket: CustomSocket) {
    this.state = GameState.WAITING_FOR_PLAYERS

    this.pad1?.setReady(false)
    this.pad2?.setReady(false)
    this.score = [0, 0]

    this.io.emit('room', this.getRoomState())
  }

  private updateUser({ id, isConnected }: { id: string; isConnected?: boolean }) {
    const user = this.users.findById(id)

    if (!user) {
      return
    }

    if (isConnected !== undefined) {
      user.isConnected = isConnected
    }

    this.users.save(user)
  }

  private getGameState() {
    return {
      pad1: this.pad1?.serialize(),
      pad2: this.pad2?.serialize(),
      ball: this.ball.serialize(),
      score: this.score
    }
  }
}
export { World }
