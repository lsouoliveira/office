import { Entity } from '../entities/entity'
import { Game } from '../game'

class Scene {
  private entities: Entity[] = []
  private _game?: Game

  init(game: Game) {
    this._game = game
  }

  start() {}

  update(dt: number) {
    this.entities.forEach((e) => e.update(dt))
  }

  fixedUpdate(dt: number) {
    this.entities.forEach((e) => e.fixedUpdate(dt))
  }

  addEntity(e: Entity) {
    this.entities.push(e)
    e.init(this)
    e.start()
  }

  removeEntity(entity: Entity) {
    this.entities = this.entities.filter((e) => e != entity)
  }

  destroy() {
    this.entities.forEach((e) => e.destroy())
  }

  get game(): Game {
    if (!this._game) {
      throw new Error('Game is undefined')
    }

    return this._game
  }
}

export { Scene }
