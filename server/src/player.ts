import EventEmitter from 'events'
import { Grid, AStarFinder } from 'pathfinding'

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
    Moving
}

interface PlayerData {
    id: string
    position: Position 
    direction: Direction
    state: PlayerState
    speed: number
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
    private grid: number[][]

    constructor(player: Player, grid: number[][]) {
        this.player = player
        this.grid = grid
    }

    update(dt: number) {
        if (this.player.playerData.state === PlayerState.Moving) {
            if (!this.targetPath || this.targetPath.length === 0) {
                this.player.playerData.state = PlayerState.Idle
            } else {
                const player = this.player.playerData
                const target = this.targetPath[0]
                const targetPos = [target[0] * 16, target[1] * 16]

                if (player.position.x < targetPos[0]) {
                    player.direction = Direction.East
                } else if (player.position.x > targetPos[0]) {
                    player.direction = Direction.West
                } else if (player.position.y < targetPos[1]) {
                    player.direction = Direction.South
                } else if (player.position.y > targetPos[1]) {
                    player.direction = Direction.North
                }

                if (this.moveToPoint(targetPos[0], targetPos[1], dt)) {
                    this.targetPath.shift()
                }
            }

            this.player.notifyChange()
        }
    }

    moveTo(tileX, tileY) {
        if (!this.validatePosition(tileX, tileY)) {
            return
        }

        this.player.playerData.state = PlayerState.Moving

        const playerPos = [this.gridX(), this.gridY()]

        const shortestPath = new PathFinding(this.grid).findPath(
            playerPos[0],
            playerPos[1],
            tileX,
            tileY
        )

        if (shortestPath.length === 0) {
          this.player.playerData.state = PlayerState.Idle
        } else {
          this.targetPath = shortestPath
        }
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

        return this.grid[y][x] === 0
    }

    gridWidth() {
        return this.grid[0].length
    }

    gridHeight() {
        return this.grid.length
    }

    gridX() {
        return Math.floor(this.player.playerData.position.x / 16)
    }

    gridY() {
        return Math.floor(this.player.playerData.position.y / 16)
    }
}

class Player extends EventEmitter {
    public playerData: PlayerData
    public movement: PlayerMovement

    constructor(playerData: PlayerData) {
        super()

        this.playerData = playerData
    }

    init(playerMovement: PlayerMovement) {
        this.movement = playerMovement
    }

    update(dt: number) {
        this.movement.update(dt)
    }

    notifyChange() {
        this.emit('change', this.playerData)
    }
}

export { Player, PlayerState, Direction, PlayerData, PlayerMovement }
