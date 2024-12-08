import { Game } from '../game'
import { Scene } from './scene'

class SceneManager {
  private game: Game
  private currentScene?: Scene

  constructor(game: Game) {
    this.game = game
  }

  update(dt: number) {
    this.currentScene?.update(dt)
  }

  fixedUpdate(dt: number) {
    this.currentScene?.fixedUpdate(dt)
  }

  loadScene(sceneClass: any) {
    this.currentScene?.destroy()

    this.currentScene = new sceneClass()
    this.currentScene?.init(this.game)
    this.currentScene?.start()
  }
}

export { SceneManager }
