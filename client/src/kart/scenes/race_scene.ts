import { Scene } from './scene'
import { KartEntityTemplate } from '../entity_templates/kart_entity_template'
import { Entity } from '../entities/entity'

class RaceScene extends Scene {
  private kart?: Entity

  constructor() {
    super()
  }

  start() {
    super.start()

    this.kart = new KartEntityTemplate().build()

    this.addEntity(this.kart)
  }

  update(dt: number) {
    super.update(dt)
  }
}

export { RaceScene }
