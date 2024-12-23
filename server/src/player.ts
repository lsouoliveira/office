import EventEmitter from 'events'
import { Grid, AStarFinder } from 'pathfinding'
import { GameMap } from './map/game_map'
import { Tile } from './map/tile'
import { Task } from './tasks/task'
import { Item } from './items/item'
import { Inventory } from './inventory/inventory'
import Spell from './spells/spell'
import { SPELLS } from './spells/spells'
import SpellData from './spells/spell_data'
import { TILE_SIZE } from './config'
import { EQUIPMENTS } from './equipments/equipments'
import { VehicleController } from './vehicles/vehicle_controller'

const getTileBehindPlayer = (player: Player): number[] => {
  const playerX = player.movement.gridX()
  const playerY = player.movement.gridY()

  switch (player.playerData.direction) {
    case Direction.North:
      return [playerX, playerY + 1]
    case Direction.South:
      return [playerX, playerY - 1]
    case Direction.East:
      return [playerX - 1, playerY]
    case Direction.West:
      return [playerX + 1, playerY]
    default:
      throw new Error('Invalid direction')
  }
}

const findAvailableNeighbourTile = (player: Player, map: GameMap): number[] | null => {
  const tileBehind = getTileBehindPlayer(player)
  const possibleTileNeighbors = [
    tileBehind,
    [tileBehind[0] + 1, tileBehind[1]],
    [tileBehind[0] + 1, tileBehind[1] - 1],
    [tileBehind[0], tileBehind[1] - 1],
    [tileBehind[0] - 1, tileBehind[1] - 1],
    [tileBehind[0] - 1, tileBehind[1]],
    [tileBehind[0] - 1, tileBehind[1] + 1],
    [tileBehind[0], tileBehind[1] + 1],
    [tileBehind[0] + 1, tileBehind[1] + 1]
  ]

  for (const neighbourTile of possibleTileNeighbors) {
    if (!map.contains(neighbourTile[0], neighbourTile[1])) {
      continue
    }

    if (player.movement.canReach(neighbourTile[0], neighbourTile[1])) {
      return neighbourTile
    }
  }

  return null
}

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
  isEating: boolean
  isAdmin: boolean
  skin: string
  helmetSlot?: Item
  glassesSlot?: Item
  faceMaskSlot?: Item
  rightHandSlot?: Item
  vehicle?: Item
  userId: number
  money: number
  isLevitating: boolean
  isProtegoActive: boolean
}

enum EquipmentType {
  Helmet,
  Wand,
  Glasses,
  FaceMask,
  Vehicle
}

class Equipment {
  private id: string
  private type: EquipmentType
  private hideHair: boolean

  constructor(id: string, type: EquipmentType, hideHair: boolean) {
    this.id = id
    this.type = type
    this.hideHair = hideHair
  }

  getId() {
    return this.id
  }

  getType() {
    return this.type
  }

  getHideHair() {
    return this.hideHair
  }

  toData() {
    return {
      id: this.id,
      type: this.type,
      hideHair: this.hideHair
    }
  }
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
        const targetPos = [target[0] * TILE_SIZE, target[1] * TILE_SIZE]

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

    if (this.player.isFollowing()) {
      this.follow()
    }
  }

  follow() {
    try {
      if (!this.nextTile && this.player.followee) {
        const followee = this.player.followee

        if (!this.map.contains(followee.movement.gridX(), followee.movement.gridY())) {
          this.player.stopFollowing()

          return
        }

        const targetTile = findAvailableNeighbourTile(this.player.followee, this.map)

        if (!targetTile) {
          this.player.stopFollowing()

          return
        }

        this.moveTo(targetTile[0], targetTile[1])
      }
    } catch (_) {}
  }

  stop() {
    this.targetPath = []
    this.nextTile = undefined
    this.player.playerData.state = PlayerState.Idle
  }

  moveTo(tileX, tileY) {
    if (this.player.playerData.speed <= 0) {
      return
    }

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
    return Math.floor(this.player.playerData.position.x / TILE_SIZE)
  }

  gridY() {
    return Math.floor(this.player.playerData.position.y / TILE_SIZE)
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

  getMap() {
    return this.map
  }
}

const DRINKING_TIME = 30000
const EATING_TIME = 5 * 60 * 1000
const patronoDuration = 30
const patronos = [
  '🐶',
  '🐺',
  '🦊',
  '🐱',
  '🦁',
  '🐯',
  '🐴',
  '🫎',
  '🐎',
  '🦄',
  '🦌',
  '🦬',
  '🐗',
  '🐑',
  '🦙',
  '🐇',
  '🦔',
  '🦅',
  '🦢',
  '🦉'
]
const PROTEGO_DURATION = 5000

class Player extends EventEmitter {
  playerData: PlayerData
  movement: PlayerMovement
  followee?: Player

  private tasks: Task[] = []
  private occupiedItem: Item
  private drinkingTimeout: NodeJS.Timeout
  private eatingTimeout: NodeJS.Timeout
  private inventory: Inventory = new Inventory()
  private spells: Spell[] = []
  private patronoTimer: number
  private isPatronoActive: boolean
  private levitateTimeout: NodeJS.Timeout
  private protegoTimeout: NodeJS.Timeout
  private freezeTimeout: NodeJS.Timeout
  private followTimeout: NodeJS.Timeout
  private stunTimeout: NodeJS.Timeout
  private originalSpeed: number
  private _vehicleController: VehicleController

  constructor(playerData: PlayerData) {
    super()

    this.playerData = playerData
    this.playerData.isLevitating = false
    this.playerData.isProtegoActive = false
    this.playerData.isDrinking = false
    this.playerData.isEating = false
    this.isPatronoActive = false
    this.originalSpeed = this.playerData.speed
    this.playerData.vehicle = undefined

    SPELLS.forEach((spellData: SpellData) => this.spells.push(new Spell(spellData)))
  }

  init(playerMovement: PlayerMovement) {
    this.movement = playerMovement
    this._vehicleController = new VehicleController(this)
  }

  get vehicleController() {
    if (!this._vehicleController) {
      throw Error('VehicleController was not initialized')
    }

    return this._vehicleController
  }

  update(dt: number) {
    try {
      this.performNextTask()
      this.movement.update(dt)
    } catch (e) {}

    this.spells.forEach((spell) => spell.update(dt))

    if (this.isPatronoActive) {
      this.patronoTimer += dt

      if (this.patronoTimer >= patronoDuration) {
        this.isPatronoActive = false
        this.notifyChange()
      }
    }
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
    this.playerData.position.x = tile.x * TILE_SIZE
    this.playerData.position.y = tile.y * TILE_SIZE
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
    this.clearEatingStatus()

    clearTimeout(this.drinkingTimeout)

    this.playerData.isDrinking = true

    this.drinkingTimeout = setTimeout(() => {
      this.playerData.isDrinking = false
      this.notifyChange()
    }, DRINKING_TIME)

    this.notifyChange()
  }

  eat() {
    this.clearEatingStatus()

    clearTimeout(this.eatingTimeout)

    this.playerData.isEating = true

    this.eatingTimeout = setTimeout(() => {
      this.playerData.isEating = false
      this.notifyChange()
    }, EATING_TIME)

    this.notifyChange()
  }

  clearEatingStatus() {
    clearTimeout(this.drinkingTimeout)
    clearTimeout(this.eatingTimeout)

    this.playerData.isDrinking = false
    this.playerData.isEating = false
  }

  setSkin(skin: string) {
    this.playerData.skin = skin
    this.notifyChange()
  }

  teleport(x: number, y: number) {
    this.clearTasks()
    this.movement.stop()
    this.playerData.position.x = x
    this.playerData.position.y = y

    this.notifyChange()
  }

  isSitting() {
    return this.playerData.state === PlayerState.Sitting
  }

  setSpeed(speed: number) {
    this.playerData.speed = speed

    this.notifyChange()
  }

  setName(name: string) {
    this.playerData.name = name
    this.notifyChange()
  }

  getUserId() {
    return this.playerData.userId
  }

  notifyChange() {
    this.emit('change', this.getPlayerData())
  }

  equip(eq: Item) {
    switch (eq.getEquipmentType()) {
      case EquipmentType.Helmet:
        if (this.playerData.helmetSlot) {
          this.unequip(this.playerData.helmetSlot)
        }

        this.playerData.helmetSlot = eq
        break
      case EquipmentType.Glasses:
        if (this.playerData.glassesSlot) {
          this.unequip(this.playerData.glassesSlot)
        }

        this.playerData.glassesSlot = eq
        break
      case EquipmentType.FaceMask:
        if (this.playerData.faceMaskSlot) {
          this.unequip(this.playerData.faceMaskSlot)
        }

        this.playerData.faceMaskSlot = eq
        break
      case EquipmentType.Wand:
        if (this.playerData.rightHandSlot) {
          this.unequip(this.playerData.rightHandSlot)
        }

        this.playerData.rightHandSlot = eq
        break
      case EquipmentType.Vehicle:
        if (this.playerData.vehicle) {
          return
        }

        this.playerData.vehicle = eq
        break
    }

    this.notifyChange()
  }

  unequip(item: Item) {
    switch (item.getEquipmentType()) {
      case EquipmentType.Helmet:
        if (this.playerData.helmetSlot?.getId() === item.getId()) {
          this.playerData.helmetSlot = undefined
        }
        break
      case EquipmentType.Glasses:
        if (this.playerData.glassesSlot?.getId() === item.getId()) {
          this.playerData.glassesSlot = undefined
        }
        break
      case EquipmentType.FaceMask:
        if (this.playerData.faceMaskSlot?.getId() === item.getId()) {
          this.playerData.faceMaskSlot = undefined
        }
        break
      case EquipmentType.Wand:
        if (this.playerData.rightHandSlot?.getId() === item.getId()) {
          this.playerData.rightHandSlot = undefined
        }
        break
      case EquipmentType.Vehicle:
        if (this.playerData.vehicle?.getId() === item.getId()) {
          this.vehicleController.exitVehicle()
        }
        break
    }

    this.notifyChange()
  }

  getEquipment(type: EquipmentType) {
    switch (type) {
      case EquipmentType.Helmet:
        return this.playerData.helmetSlot
      case EquipmentType.Glasses:
        return this.playerData.glassesSlot
      case EquipmentType.FaceMask:
        return this.playerData.faceMaskSlot
      case EquipmentType.Wand:
        return this.playerData.rightHandSlot
    }
  }

  addMoney(amount: number) {
    this.playerData.money += amount
    this.notifyChange()
  }

  getMoney() {
    return this.playerData.money
  }

  addItem(item: Item) {
    this.inventory.addItem(item)
    this.notifyChange()
  }

  getInventory() {
    return this.inventory
  }

  getId() {
    return this.playerData.id
  }

  getName() {
    return this.playerData.name
  }

  getPlayerData() {
    return {
      id: this.playerData.id,
      position: this.playerData.position,
      direction: this.playerData.direction,
      state: this.playerData.state,
      speed: this.playerData.speed,
      name: this.playerData.name,
      isDrinking: this.playerData.isDrinking,
      isEating: this.playerData.isEating,
      isAdmin: this.playerData.isAdmin,
      skin: this.playerData.skin,
      helmetSlot: this.playerData.helmetSlot?.toData(),
      glassesSlot: this.playerData.glassesSlot?.toData(),
      faceMaskSlot: this.playerData.faceMaskSlot?.toData(),
      rightHandSlot: this.playerData.rightHandSlot?.toData(),
      vehicle: this.playerData.vehicle?.toData(),
      userId: this.playerData.userId,
      money: this.playerData.money,
      patrono: this.getPatrono(),
      isPatronoActive: this.isPatronoActive,
      isLevitating: this.playerData.isLevitating,
      isProtegoActive: this.playerData.isProtegoActive
    }
  }

  canCastSpell(spellId: number) {
    if (this.playerData.rightHandSlot?.getEquipmentType() !== EquipmentType.Wand) {
      return false
    }

    if (this.isFollowing()) {
      return false
    }

    const spell = this.spells.find((spell) => spell.Id === spellId)

    if (!spell) {
      console.log(`Spell with id ${spellId} not found`)
      return false
    }

    return spell.canCast()
  }

  castSpell(spellId: number) {
    const spell = this.spells.find((spell) => spell.Id === spellId)

    if (!spell) {
      return
    }

    spell.cast()
  }

  getPosition() {
    return this.playerData.position
  }

  getCenterPosition() {
    return {
      x: this.playerData.position.x + 8,
      y: this.playerData.position.y + 8
    }
  }

  getDirectionVector() {
    switch (this.playerData.direction) {
      case Direction.North:
        return { x: 0, y: -1 }
      case Direction.South:
        return { x: 0, y: 1 }
      case Direction.East:
        return { x: 1, y: 0 }
      case Direction.West:
        return { x: -1, y: 0 }
    }
  }

  contains(x: number, y: number, width: number, height: number) {
    return (
      x < this.playerData.position.x + TILE_SIZE &&
      x + width > this.playerData.position.x &&
      y < this.playerData.position.y + TILE_SIZE &&
      y + height > this.playerData.position.y - TILE_SIZE
    )
  }

  freeze() {
    this.clearSlowDown()

    this.originalSpeed = this.playerData.speed

    this.setSpeed(0)

    this.freezeTimeout = setTimeout(() => {
      this.setSpeed(this.originalSpeed)
    }, 5000)
  }

  stun() {
    this.clearSlowDown()

    this.originalSpeed = this.playerData.speed

    this.setSpeed(10)

    this.stunTimeout = setTimeout(() => {
      this.setSpeed(this.originalSpeed)
    }, 5000)
  }

  clearSlowDown() {
    clearTimeout(this.freezeTimeout)
    clearTimeout(this.stunTimeout)
    this.setSpeed(this.originalSpeed)
  }

  patrono() {
    this.isPatronoActive = true
    this.patronoTimer = 0
    this.notifyChange()
  }

  getPatrono() {
    const nameSum = this.playerData.name
      .toLowerCase()
      .split('')
      .filter((char) => char.match(/[a-z]/))
      .reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const patronoIndex = nameSum % patronos.length

    return patronos[patronoIndex]
  }

  levitate() {
    clearTimeout(this.levitateTimeout)

    this.playerData.isLevitating = true
    this.notifyChange()

    this.levitateTimeout = setTimeout(() => {
      this.playerData.isLevitating = false
      this.notifyChange()
    }, 30000)
  }

  setPosition(position: Position) {
    this.playerData.position = position
    this.notifyChange()
  }

  protego() {
    clearTimeout(this.protegoTimeout)

    this.playerData.isProtegoActive = true

    this.protegoTimeout = setTimeout(() => {
      this.playerData.isProtegoActive = false
      this.notifyChange()
    }, PROTEGO_DURATION)

    this.notifyChange()
  }

  isProtegoActive() {
    return this.playerData.isProtegoActive
  }

  dispelProtego() {
    this.playerData.isProtegoActive = false
    this.notifyChange()
    clearTimeout(this.protegoTimeout)
  }

  follow(player: Player) {
    this.followee = player
  }

  followForDuration(player: Player, duration: number) {
    clearTimeout(this.followTimeout)
    this.follow(player)

    this.followTimeout = setTimeout(() => {
      if (player.getId() == this.followee?.getId()) {
        this.stopFollowing()
      }
    }, duration)
  }

  isFollowing() {
    return this.followee != null
  }

  stopFollowing() {
    this.followee = undefined
    this.movement.stop()
  }
}

export { Player, PlayerState, Direction, PlayerData, PlayerMovement, Equipment, EquipmentType }
