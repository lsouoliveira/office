import { AnimatedSprite, Texture } from 'pixi.js'
import { Animation } from './animation'

class Animator {
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

    playing() : string | undefined {
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

export {
    Animator
}
