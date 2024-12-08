import { SceneManager } from './scenes/scene_manager'
import * as PIXI from 'pixi.js'
import { RaceScene } from './scenes/race_scene'
import { Input } from './utils/input'
import * as Matter from 'matter-js'

const FIXED_TICK_RATE = 1 / 60

class Game {
  private root: HTMLElement
  private timer: number = 0

  readonly app: PIXI.Application
  readonly sceneManager: SceneManager
  readonly input: Input
  readonly physicsEngine: Matter.Engine

  constructor(root: HTMLElement) {
    this.root = root
    this.sceneManager = new SceneManager(this)
    this.app = new PIXI.Application()
    this.input = new Input()
    this.physicsEngine = Matter.Engine.create()
    this.physicsEngine.gravity.scale = 0
    this.physicsEngine.timing.timeScale = 0.001
  }

  async init() {
    await this.app.init({ background: '#000000', resizeTo: this.root })
    this.app.stage.eventMode = 'static'
    this.app.stage.hitArea = this.app.screen

    await PIXI.Assets.loadBundle('kart')

    this.onReady()
  }

  private async onReady() {
    this.root.appendChild(this.app.canvas)
    this.app.ticker.add(this.update.bind(this))
    this.input.setup()

    this.sceneManager.loadScene(RaceScene)
  }

  private update(ticker: PIXI.Ticker) {
    const dt = ticker.deltaMS / 1000

    this.timer += dt

    if (this.timer >= FIXED_TICK_RATE) {
      this.timer = 0

      Matter.Engine.update(this.physicsEngine, FIXED_TICK_RATE * 1000)
      this.sceneManager.fixedUpdate(FIXED_TICK_RATE)
    }

    this.sceneManager.update(dt)
  }
}

export { Game }
