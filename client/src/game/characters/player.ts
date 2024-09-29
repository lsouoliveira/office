import * as PIXI from 'pixi.js'
import { AnimatedSprite, Spritesheet } from 'pixi.js'
import { Animator } from './../animation/animator'
import { PlayerMessage } from './../entities/player_message'

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

class Player extends AnimatedSprite {
  public readonly id: string
  private animator: Animator
  private lastMessage: PlayerMessage
  private name: string
  public playerName: PIXI.Text

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

  updateData(data: any) {
    this.position.set(data.position.x, data.position.y)
    this.name = data.name

    this.playerName.text = this.name

    if (data.state == State.Moving) {
      switch (data.direction) {
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
    } else {
      switch (data.direction) {
        case Direction.North:
          this.animator.play('idle_north')
          break
        case Direction.South:
          if (data.isDrinking) {
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
  }

  sit(x: number, y: number, facing: Direction) {
    switch (facing) {
      case Direction.North:
        this.animator.play('idle_north')
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

  clear() {
    this.playerName.destroy()
  }
}

export { Player, Direction }
