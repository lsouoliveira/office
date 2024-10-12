import EventEmitter from 'events'
import { Grid, AStarFinder } from 'pathfinding'
import { GameMap } from './map'
import { Task } from './tasks/task'
import { Item } from './items/item'

interface Position {
  x: number
  y: number
}

enum Direction {
  North,
  South,
  East,
  West
}

enum PlayerState {
  Idle,
  Moving,
  Sitting
}

interface PlayerData {
  id: string
  position: Position
  direction: Direction
  state: PlayerState
  speed: number
  name: string
  isDrinking: boolean
  isAdmin: boolean
  skin: string
}

class PathFinding {
  private grid: number[][]

  constructor(grid: number[][]) {
    this.grid = grid
  }

  findPath(startX, startY, endX, endY) {
    const finder = new AStarFinder({
      allowDiagonal: false,
      dontCrossCorners: true
    })

    return finder.findPath(startX, startY, endX, endY, new Grid(this.grid))
  }
}

function lerp(a, b, t) {
  return a + (b - a) * t
}

class PlayerMovement {
  private player: Player
  private targetPath?: number[][]
  private nextTile?: number[]
  private map: GameMap

  constructor(player: Player, map: GameMap) {
    this.player = player
    this.map = map
  }

  update(dt: number) {
    if (this.player.playerData.state === PlayerState.Moving) {
      if (!this.nextTile) {
        this.player.playerData.state = PlayerState.Idle
      } else {
        const player = this.player.playerData
        const target = this.nextTile
        const targetPos = [target[0] * 16, target[1] * 16]

        player.direction = this.directionFor(target[0], target[1])

        if (this.moveToPoint(targetPos[0], targetPos[1], dt)) {
          this.nextTile = this.targetPath.shift()

          if (this.nextTile) {
            const direction = this.directionFor(this.nextTile[0], this.nextTile[1])

            this.player.emit('move', { x: this.nextTile[0], y: this.nextTile[1], direction })
          }
        }
      }
    }
  }

  stop() {
    this.targetPath = []
    this.nextTile = undefined
    this.player.playerData.state = PlayerState.Idle
  }

  moveTo(tileX, tileY) {
    if (!this.validatePosition(tileX, tileY)) {
      return
    }

    if (this.player.isOccupyingItem()) {
      const item = this.player.getOccupiedItem()

      item.vacate()
    }

    this.player.playerData.state = PlayerState.Moving

    const playerPos = [this.gridX(), this.gridY()]

    const shortestPath = new PathFinding(this.createGrid()).findPath(
      playerPos[0],
      playerPos[1],
      tileX,
      tileY
    )

    if (shortestPath.length === 0) {
      this.player.playerData.state = PlayerState.Idle
    } else {
      this.targetPath = shortestPath

      if (this.targetPath[0][0] === this.gridX() && this.targetPath[0][1] === this.gridY()) {
        this.targetPath.shift()
      }

      if (!this.nextTile) {
        this.nextTile = this.targetPath.shift()

        if (this.nextTile) {
          const nextTileDirection = this.directionFor(this.nextTile[0], this.nextTile[1])

          this.player.playerData.direction = nextTileDirection
          this.player.emit('move', {
            x: this.nextTile[0],
            y: this.nextTile[1],
            direction: nextTileDirection
          })
        }
      }
    }
  }

  directionFor(tileX, tileY) {
    if (tileX === this.gridX() && tileY === this.gridY()) {
      return this.player.playerData.direction
    }

    if (tileX > this.gridX()) {
      return Direction.East
    } else if (tileX < this.gridX()) {
      return Direction.West
    } else if (tileY > this.gridY()) {
      return Direction.South
    }

    return Direction.North
  }

  getDistanceTo(tileX, tileY) {
    return Math.abs(this.gridX() - tileX) + Math.abs(this.gridY() - tileY)
  }

  moveToPoint(x, y, dt) {
    const playerData = this.player.playerData

    const dx = x - playerData.position.x
    const dy = y - playerData.position.y

    const distance = Math.sqrt(dx ** 2 + dy ** 2)

    if (distance === 0) {
      return true
    }

    const t = Math.min(1, (playerData.speed * dt) / distance)

    playerData.position.x = lerp(playerData.position.x, x, t)
    playerData.position.y = lerp(playerData.position.y, y, t)

    if (distance < 1) {
      playerData.position.x = x
      playerData.position.y = y

      return true
    }

    return false
  }

  validatePosition(x, y) {
    if (x < 0 || x >= this.gridWidth() || y < 0 || y >= this.gridHeight()) {
      return false
    }

    return this.map.getTile(x, y).isWalkable()
  }

  isNeighbour(tileX, tileY) {
    return Math.abs(this.gridX() - tileX) <= 1 && Math.abs(this.gridY() + 1 - tileY) <= 1
  }

  gridWidth() {
    return this.map.width
  }

  gridHeight() {
    return this.map.height
  }

  gridX() {
    return Math.floor(this.player.playerData.position.x / 16)
  }

  gridY() {
    return Math.floor(this.player.playerData.position.y / 16)
  }

  isMoving() {
    return this.player.playerData.state === PlayerState.Moving
  }

  canReach(tileX: number, tileY: number) {
    if (!this.validatePosition(tileX, tileY)) {
      return false
    }

    const path = new PathFinding(this.createGrid()).findPath(
      this.gridX(),
      this.gridY(),
      tileX,
      tileY
    )

    if (path.length === 0) {
      return false
    }

    return true
  }

  createGrid() {
    const grid = []

    for (let y = 0; y < this.gridHeight(); y++) {
      grid[y] = []

      for (let x = 0; x < this.gridWidth(); x++) {
        grid[y][x] = this.map.getTile(x, y).isWalkable() ? 0 : 1
      }
    }

    return grid
  }
}

const DRINKING_TIME = 30000

class Player extends EventEmitter {
  public playerData: PlayerData
  public movement: PlayerMovement
  private tasks: Task[] = []
  private occupiedItem: Item
  private drinkingTimeout: NodeJS.Timeout

  constructor(playerData: PlayerData) {
    super()

    this.playerData = playerData
  }

  init(playerMovement: PlayerMovement) {
    this.movement = playerMovement
  }

  update(dt: number) {
    this.performNextTask()
    this.movement.update(dt)
  }

  performNextTask() {
    const task = this.nextTask()

    if (task) {
      task.perform()

      if (task.isDone()) {
        this.tasks.shift()
      }
    }
  }

  addTask(task: Task) {
    this.tasks.push(task)
  }

  clearTasks() {
    this.tasks = []
  }

  nextTask() {
    if (this.tasks.length === 0) {
      return null
    }

    return this.tasks[0]
  }

  sit(tile: any, item: any) {
    if (item.isOccupied()) {
      return false
    }

    item.occupy(this)

    this.playerData.state = PlayerState.Sitting
    this.playerData.direction = item.getFacing()
    this.playerData.position.x = tile.x * 16
    this.playerData.position.y = tile.y * 16
    this.occupiedItem = item

    this.notifyChange()

    return true
  }

  isOccupyingItem() {
    return this.occupiedItem !== undefined
  }

  getOccupiedItem() {
    return this.occupiedItem
  }

  drink() {
    clearTimeout(this.drinkingTimeout)

    this.playerData.isDrinking = true

    this.drinkingTimeout = setTimeout(() => {
      this.playerData.isDrinking = false
      this.notifyChange()
    }, DRINKING_TIME)

    this.notifyChange()
  }

  setSkin(skin: string) {
    this.playerData.skin = skin
    this.notifyChange()
  }

  teleport(x, y) {
    this.playerData.position.x = x
    this.playerData.position.y = y

    this.notifyChange()
  }

  setSpeed(speed: number) {
    this.playerData.speed = speed
    this.notifyChange()
  }

  setName(name: string) {
    this.playerData.name = name
    this.notifyChange()
  }

  notifyChange() {
    this.emit('change', this.playerData)
  }
}

export { Player, PlayerState, Direction, PlayerData, PlayerMovement }
