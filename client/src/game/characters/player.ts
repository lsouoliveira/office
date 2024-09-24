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
  Moving
}

class Player extends AnimatedSprite {
  public readonly id: string
  private animator: Animator
  private lastMessage: PlayerMessage
  private name: string

  constructor(id: string, spriteSheet: Spritesheet) {
    super(spriteSheet.animations.idle_south)

    this.id = id
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
          this.animator.play('idle_south')
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
}

export { Player, Direction }
