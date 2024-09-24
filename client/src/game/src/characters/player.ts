import { AnimatedSprite, Spritesheet } from 'pixi.js'
import { Animator } from './../animation/animator'

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

  updateData(data: any) {
      this.position.set(data.position.x, data.position.y)

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
