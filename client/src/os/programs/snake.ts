import { Process } from '../processes/process'
import { OS } from '../windows/window'

const SNAKE_TILE_SIZE = 16
const SNAKE_SPEED_INCREMENT = 0.001

class Snake extends Process {
  private window?: OS.Window
  private snakeDirection: number[] = [1, 0]
  private snakePosition: number[]
  private snake: number[][]
  private timer: number = 0
  private foodPosition: number[]
  private snakeSpeed: number = 0

  onStart() {
    console.log('Snake process started')

    this.window = this.system.Windows().createWindow({
      title: 'Snake',
      x: this.system.getResolution().width / 2 - 320,
      y: this.system.getResolution().height / 2 - 240,
      width: 640,
      height: 480,
      hasDecorations: true
    })

    if (!this.window) {
      throw new Error('Window not initialized')
    }

    this.restart()
  }

  onTerminate() {
    if (this.window) {
      this.window.close()
    }
  }

  update(dt: number) {
    if (!this.window.isFocused()) {
      return
    }

    if (this.system.InputSystem().getKeyDown('w')) {
      this.snakeDirection = [0, -1]
    } else if (this.system.InputSystem().getKeyDown('s')) {
      this.snakeDirection = [0, 1]
    } else if (this.system.InputSystem().getKeyDown('a')) {
      this.snakeDirection = [-1, 0]
    } else if (this.system.InputSystem().getKeyDown('d')) {
      this.snakeDirection = [1, 0]
    }

    this.timer += dt

    if (this.timer > this.snakeSpeed) {
      this.timer = 0

      const newHead = [
        this.snake[0][0] + this.snakeDirection[0],
        this.snake[0][1] + this.snakeDirection[1]
      ]

      this.snake.unshift(newHead)
      this.snake.pop()
    }

    if (this.snake[0][0] === this.foodPosition[0] && this.snake[0][1] === this.foodPosition[1]) {
      this.snake.push(this.snake[this.snake.length - 1])

      this.foodPosition = [
        Math.floor(Math.random() * (this.window.getWidth() / SNAKE_TILE_SIZE)),
        Math.floor(Math.random() * (this.window.getHeight() / SNAKE_TILE_SIZE))
      ]

      this.snakeSpeed -= SNAKE_SPEED_INCREMENT
    }

    if (this.isSnakeOutbounds() || this.isSnakeEatingItself()) {
      this.restart()
    }
  }

  restart() {
    this.snakeSpeed = 0.1
    this.snake = [
      [2, 0],
      [1, 0],
      [0, 0]
    ]
    this.placeFood()

    this.snakeDirection = [1, 0]
  }

  isSnakeOutbounds() {
    return (
      this.snake[0][0] < 0 ||
      this.snake[0][0] >= this.window.getWidth() / SNAKE_TILE_SIZE ||
      this.snake[0][1] < 0 ||
      this.snake[0][1] >= this.window.getHeight() / SNAKE_TILE_SIZE
    )
  }

  isSnakeEatingItself() {
    for (let i = 1; i < this.snake.length; i++) {
      if (this.snake[0][0] === this.snake[i][0] && this.snake[0][1] === this.snake[i][1]) {
        return true
      }
    }

    return false
  }

  placeFood() {
    this.foodPosition = [
      Math.floor(Math.random() * (this.window.getWidth() / SNAKE_TILE_SIZE)),
      Math.floor(Math.random() * (this.window.getHeight() / SNAKE_TILE_SIZE))
    ]
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

    windowContext.fillStyle = 'black'
    windowContext.fillRect(0, 0, this.window.getWidth(), this.window.getHeight())

    windowContext.fillStyle = 'red'
    windowContext.fillRect(
      this.foodPosition[0] * SNAKE_TILE_SIZE,
      this.foodPosition[1] * SNAKE_TILE_SIZE,
      SNAKE_TILE_SIZE,
      SNAKE_TILE_SIZE
    )

    this.snake.forEach((position) => {
      windowContext.fillStyle = 'green'
      windowContext.fillRect(
        position[0] * SNAKE_TILE_SIZE,
        position[1] * SNAKE_TILE_SIZE,
        SNAKE_TILE_SIZE,
        SNAKE_TILE_SIZE
      )
    })
  }
}

export { Snake }
