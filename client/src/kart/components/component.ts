import { Entity } from '../entities/entity'

class Component {
  private _entity?: Entity

  readonly name: string

  constructor(name: string) {
    this.name = name
  }

  init(entity: Entity) {
    this._entity = entity
  }

  start() {}

  update(_: number) {}

  fixedUpdate(_: number) {}

  destroy() {}

  getComponent(name: string) {
    return this.entity.getComponent(name)
  }

  get entity(): Entity {
    if (!this._entity) {
      throw new Error('Entity is undefined')
    }

    return this._entity
  }

  get game() {
    return this.entity.game
  }

  get transform() {
    return this.entity.transform
  }

  get input() {
    return this.entity.input
  }
}

export { Component }
