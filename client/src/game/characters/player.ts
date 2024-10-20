import * as PIXI from 'pixi.js'
import { AnimatedSprite, Spritesheet } from 'pixi.js'
import { Animator } from './../animation/animator'
import { PlayerMessage } from './../entities/player_message'
import { type Entity } from './../entities/entity'

enum Direction {
  North,
  South,
  East,
  West
}

enum State {
  Idle,
  Moving,
  Sitting
}

interface Target {
  x: number
  y: number
  direction: Direction
}

const lerp = (start: number, end: number, t: number) => {
  return start * (1 - t) + end * t
}

enum EquipmentType {
  Helmet
}

class Equipment extends AnimatedSprite {
  public readonly id: string
  public readonly type: EquipmentType
  private animator?: Animator

  constructor(id: string, type: EquipmentType, spriteSheet: Spritesheet) {
    super(spriteSheet.animations.idle_south)

    this.id = id
    this.type = type
  }

  init(animator: Animator) {
    this.animator = animator
  }

  getAnimator() {
    return this.animator
  }
}

class Player extends AnimatedSprite implements Entity {
  public readonly id: string
  private animator: Animator
  private lastMessage: PlayerMessage
  private name: string
  public playerName: PIXI.Text
  private targets: Target[] = []
  private speed = 1
  private direction: Direction
  private isDrinking: boolean
  private helmetSlot?: Equipment
  private isSitting: boolean

  constructor(id: string, spriteSheet: Spritesheet) {
    super(spriteSheet.animations.idle_south)

    this.sortableChildren = true

    this.id = id
    this.playerName = new PIXI.Text('', {
      fontFamily: 'Arial',
      fontSize: 256,
      fill: 0x00ff00,
      stroke: 0x000000,
      strokeThickness: 32
    })
    this.playerName.scale.set(8 / 256)
    this.playerName.anchor.set(0.5, 1)
    this.playerName.position.set(8, -8)
    this.playerName.zIndex = 10

    this.addChild(this.playerName)
  }

  init(animator: Animator) {
    this.animator = animator
  }

  onStart() {
    this.position.set(64, 48)
    this.anchor.set(0, 0.5)

    this.animator.play('idle_south')
  }

  getName() {
    return this.name
  }

  say(message: string) {
    if (this.lastMessage) {
      this.lastMessage.destroy()
    }

    this.lastMessage = PlayerMessage.show(this, message)

    return this.lastMessage
  }

  updateEntity(dt: number) {
    this.moveToNextTarget(dt)
  }

  moveToNextTarget(dt: number) {
    if (this.hasTargets()) {
      const target = this.targets[0]

      this.direction = target.direction

      if (this.moveToPoint(target.x * 16, target.y * 16, dt)) {
        this.targets.shift()
      } else {
        this.playWalkAnimation()
      }
    } else {
      this.playIdleAnimation()
    }
  }

  playWalkAnimation() {
    this.playAnimation('walk')
  }

  playIdleAnimation() {
    if (this.isSitting) {
      return
    }

    if (this.isDrinking && this.direction == Direction.South) {
      this.playAnimation('drink')

      return
    }

    return this.playAnimation('idle')
  }

  playAnimation(animation: string) {
    switch (this.direction) {
      case Direction.North:
        this.animator.play(animation + '_north')
        this.helmetSlot?.getAnimator().play(animation + '_north')
        break
      case Direction.South:
        this.animator.play(animation + '_south')
        this.helmetSlot?.getAnimator().play(animation + '_south')
        break
      case Direction.East:
        this.animator.play(animation + '_east')
        this.helmetSlot?.getAnimator().play(animation + '_east')
        break
      case Direction.West:
        this.animator.play(animation + '_west')
        this.helmetSlot?.getAnimator().play(animation + '_west')
        break
    }
  }

  moveToPoint(x, y, dt) {
    const dx = x - this.position.x
    const dy = y - this.position.y

    const distance = Math.sqrt(dx ** 2 + dy ** 2)

    if (distance === 0) {
      return true
    }

    const t = Math.min(1, (this.speed * dt) / distance)

    this.position.x = lerp(this.position.x, x, t)
    this.position.y = lerp(this.position.y, y, t)

    if (distance < 1) {
      this.position.x = x
      this.position.y = y

      return true
    }

    return false
  }

  updateData(data: any) {
    if (!this.hasTargets() || !this.canReach(data.position)) {
      this.clearTargets()
      this.position.set(data.position.x, data.position.y)
      this.pivot.set(0, 0)
    }

    this.direction = data.direction
    this.speed = data.speed
    this.isDrinking = data.isDrinking
    this.isSitting = data.state == State.Sitting

    this.setName(data.name)

    if (data.state == State.Sitting) {
      this.clearTargets()
      this.sit(data.position.x, data.position.y, data.direction)
    } else if (!this.hasTargets()) {
      this.playIdleAnimation()
    }
  }

  sit(x: number, y: number, facing: Direction) {
    this.clearTargets()

    switch (facing) {
      case Direction.North:
        this.playAnimation('idle')
        this.pivot.set(0, 8)
        break
      case Direction.West:
        this.playAnimation('sit')
        this.pivot.set(0, 10)
        this.pivot_offset_y = -10
        break
      case Direction.East:
        this.playAnimation('sit')
        this.pivot.set(0, 10)
        this.pivot_offset_y = -10
        break
      case Direction.South:
        this.playAnimation('idle')
        break
    }

    this.position.set(x, y)
  }

  moveTo(x: number, y: number, direction: Direction) {
    this.pivot.set(0, 0)
    this.pivot_offset_y = 0
    this.targets.push({ x, y, direction })
    this.isSitting = false
  }

  setName(name: string) {
    this.name = name
    this.playerName.text = name
  }

  hasTargets() {
    return this.targets.length > 0
  }

  canReach(position: { x: number; y: number }) {
    const tileX = Math.floor(position.x / 16)
    const tileY = Math.floor(position.y / 16)

    if (this.getTileX() == tileX && this.getTileY() == tileY) {
      return true
    }

    return this.targets.some((target) => target.x == tileX && target.y == tileY)
  }

  getTileX() {
    return Math.floor(this.position.x / 16)
  }

  getTileY() {
    return Math.floor(this.position.y / 16)
  }

  clearTargets() {
    this.targets = []
  }

  clear() {
    this.playerName.destroy()
  }

  setAnimator(animator: Animator) {
    this.animator = animator
  }

  equip(equipment: Equipment) {
    switch (equipment.type) {
      case EquipmentType.Helmet:
        if (this.helmetSlot) {
          this.removeChild(this.helmetSlot)
        }

        this.helmetSlot = equipment
        break
      default:
        return
    }

    equipment.anchor.set(0, 0.5)
    this.addChild(equipment)
  }

  unequip(equipment: Equipment) {
    switch (equipment.type) {
      case EquipmentType.Helmet:
        if (this.helmetSlot?.id === equipment.id) {
          this.helmetSlot = undefined
        }
        break
      default:
        return
    }

    this.removeChild(equipment)
  }

  getHelmet() {
    return this.helmetSlot
  }
}

export { Player, Direction, Equipment, EquipmentType }
