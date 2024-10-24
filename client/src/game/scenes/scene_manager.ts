import { Application } from 'pixi.js'
import { Scene } from './scene'

class SceneManager {
  private app: Application
  private currentScene: Scene
  private scenes: { [key: string]: Scene } = {}

  constructor(app: Application) {
    this.app = app
  }

  async load(sceneName: string) {
    const currentScene = this.currentScene

    if (currentScene) {
      await currentScene.onDestroy()
      currentScene.destroy()
    }

    this.app.stage.removeChildren()

    this.currentScene = new this.scenes[sceneName]()

    this.app.stage.addChild(this.currentScene)

    this.currentScene.init(this.app, this)
    await this.currentScene.onStart()
  }

  add(sceneName: string, scene: Scene) {
    this.scenes[sceneName] = scene
  }

  update(dt: number) {
    this.currentScene?.update(dt)
  }
}

export { SceneManager }
