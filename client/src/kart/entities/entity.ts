import { Transform } from './transform'
import { Component } from './../components/component'
import { Scene } from '../scenes/scene'

class Entity {
  private _scene?: Scene

  public transform: Transform
  public components: Component[] = []

  constructor() {
    this.transform = new Transform(this)
  }

  init(scene: Scene) {
    this._scene = scene
  }

  start() {
    this.components.forEach((component) => component.start())
  }

  update(dt: number) {
    this.components.forEach((component) => component.update(dt))
  }

  fixedUpdate(dt: number) {
    this.components.forEach((component) => component.fixedUpdate(dt))
  }

  destroy() {
    this.transform.children.forEach((transform: Transform) => transform.entity.destroy())
    this.components.forEach((component: Component) => component.destroy())
  }

  addComponent(component: Component) {
    this.components.push(component)
    component.init(this)
  }

  removeComponent(component: Component) {
    this.components = this.components.filter((c) => c != component)
  }

  getComponent(name: string) {
    return this.components.find((c) => c.name === name)
  }

  get game() {
    return this.scene.game
  }

  get scene(): Scene {
    if (!this._scene) {
      throw new Error('Scene is undefined')
    }

    return this._scene
  }

  get input() {
    return this.scene.game.input
  }
}

export { Entity }
