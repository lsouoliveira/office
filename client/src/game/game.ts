import { Application, Assets, Sprite } from 'pixi.js'
import { SceneManager } from './scenes/scene_manager'
import { Playground } from './scenes/playground'
import manifest from './manifest'

class Game extends EventTarget {
  private app: Application
  private sceneManager: SceneManager
  private root: HTMLElement
  private lastTime: number

  constructor(root: HTMLElement) {
    super()

    this.root = root
    this.app = new Application()
    this.sceneManager = new SceneManager(this.app)
  }

  async init() {
    await this.app.init({ background: '#000000', resizeTo: this.root })
    this.app.stage.eventMode = 'static'
    this.app.stage.hitArea = this.app.screen

    await Assets.init({ manifest })

    Assets.loadBundle('main').then(() => {
      this.onReady()
    })
  }

  private async onReady() {
    this.root.appendChild(this.app.view)

    this.sceneManager.add('playground', Playground)
    await this.sceneManager.load('playground')

    this.dispatchEvent(new Event('game:ready'))
    this.app.ticker.add(this.update.bind(this))

    setInterval(() => {
      this.sceneManager.fixedUpdate(1.0 / 60)
    }, 1000 / 60)
  }

  private update(dt: number) {
    this.sceneManager.update(dt)
  }
}

export { Game }
