import * as PIXI from 'pixi.js'

class SpritesheetSplitter {
  private spritesheet: PIXI.Spritesheet

  constructor(spritesheet: PIXI.Spritesheet) {
    this.spritesheet = spritesheet
  }

  split(frameWidth: number, frameHeight: number, newFrameSize: number): ComposedSpritesheet {
    const animations = this.spritesheet.animations
    const animationsMap = new Map<string, PIXI.Texture[][][]>()
    const gridWidth = frameWidth / newFrameSize
    const gridHeight = frameHeight / newFrameSize

    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        for (const animationName in animations) {
          const animation = animations[animationName]
          const frames = animation.map((textureFrame) => {
            const frame = textureFrame.frame
            const textures = []

            const textureRect = new PIXI.Rectangle(
              frame.x + x * newFrameSize,
              frame.y + y * newFrameSize,
              newFrameSize,
              newFrameSize
            )

            const texture = new PIXI.Texture({
              source: textureFrame.baseTexture,
              frame: textureRect
            })

            return texture
          })

          const grid = animationsMap.get(animationName) || []

          if (!grid[y]) {
            grid[y] = []
          }

          if (!grid[y][x]) {
            grid[y][x] = []
          }

          grid[y][x] = frames

          animationsMap.set(animationName, grid)
        }
      }
    }

    return new ComposedSpritesheet(animationsMap)
  }
}

class ComposedSpritesheet {
  private animationsMap: Map<string, PIXI.Texture[][][]>

  constructor(animationsMap: Map<string, PIXI.Texture[][][]>) {
    this.animationsMap = animationsMap
  }

  getTextures(animationName: string, x: number, y: number): PIXI.Texture[] | undefined {
    const animation = this.animationsMap.get(animationName)

    if (!animation) {
      return
    }

    return animation[y][x]
  }
}

export { SpritesheetSplitter, ComposedSpritesheet }
