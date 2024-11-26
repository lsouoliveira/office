import { AnimatedSprite, Texture } from 'pixi.js'
import { Animation } from './animation'

interface Animator {
  playing(): string | undefined
  play(name: string): void
}

class BaseAnimator implements Animator {
  private animations: any
  private animatedSprite: AnimatedSprite

  private currentAnimation?: Animation

  constructor(animatedSprite: AnimatedSprite, animations: Animation[]) {
    this.animatedSprite = animatedSprite
    this.animations = {}

    for (const animation of animations) {
      this.animations[animation.name] = animation
    }
  }

  playing(): string | undefined {
    return this.currentAnimation?.name
  }

  play(name: string) {
    if (this.currentAnimation && this.currentAnimation.name === name) {
      return
    }

    this.currentAnimation = this.animations[name]

    if (!this.currentAnimation) {
      throw new Error(`Animation ${name} not found`)
    }

    this.animatedSprite.textures = this.currentAnimation.frames
    this.animatedSprite.animationSpeed = this.currentAnimation.speed
    this.animatedSprite.play()
  }
}

class ComposedAnimator implements Animator {
  private animators: Animator[]

  constructor(animators: Animator[]) {
    this.animators = animators
  }

  playing(): string | undefined {
    return this.animators.find((animator) => animator.playing() !== undefined)?.playing()
  }

  play(name: string) {
    console.log(name)
    for (const animator of this.animators) {
      animator.play(name)
    }
  }
}

export { type Animator, BaseAnimator, ComposedAnimator }
