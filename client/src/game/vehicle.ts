import * as PIXI from 'pixi.js'
import { type Animator } from './animation/animator'

class Vehicle {
  readonly sprite: PIXI.AnimatedSprite
  readonly animator: Animator

  constructor(sprite: PIXI.AnimatedSprite, animator: Animator) {
    this.sprite = sprite
    this.animator = animator
  }

  turnNorth() {
    this.animator.play('idle_north')
    this.sprite.position.set(-48, -96)
  }

  turnSouth() {
    this.animator.play('idle_south')
    this.sprite.position.set(-48, -144)
  }

  turnEast() {
    this.animator.play('idle_east')
    this.sprite.position.set(-144, -96)
  }

  turnWest() {
    this.animator.play('idle_west')
    this.sprite.position.set(-48, -96)
  }
}

export { Vehicle }
