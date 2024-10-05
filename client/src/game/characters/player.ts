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

  constructor(id: string, spriteSheet: Spritesheet) {
    super(spriteSheet.animations.idle_south)

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
    switch (this.direction) {
      case Direction.North:
        this.animator.play('walk_north')
        break
      case Direction.South:
        this.animator.play('walk_south')
        break
      case Direction.East:
        this.animator.play('walk_east')
        break
      case Direction.West:
        this.animator.play('walk_west')
        break
    }
  }

  playIdleAnimation() {
    switch (this.direction) {
      case Direction.North:
        this.animator.play('idle_north')
        break
      case Direction.South:
        if (this.isDrinking) {
          this.animator.play('drink_south')
        } else {
          this.animator.play('idle_south')
        }

        break
      case Direction.East:
        this.animator.play('idle_east')
        break
      case Direction.West:
        this.animator.play('idle_west')
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
        this.animator.play('idle_north')
        this.pivot.set(0, 8)
        return
        break
      case Direction.West:
        this.animator.play('sit_west')
        break
      case Direction.East:
        this.animator.play('sit_east')
        break
      case Direction.South:
        this.animator.play('idle_south')
        break
    }

    this.position.set(x, y)
  }

  moveTo(x: number, y: number, direction: Direction) {
    this.pivot.set(0, 0)
    this.targets.push({ x, y, direction })
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
}

export { Player, Direction }
