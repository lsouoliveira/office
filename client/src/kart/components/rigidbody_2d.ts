import { Vector3 } from '../utils/vector3'
import { Component } from './component'
import * as Matter from 'matter-js'
import * as PIXI from 'pixi.js'

const CENTER_OF_MASS_RADIUS = 10

class Rigidbody2D extends Component {
  private _width: number = 100
  private _height: number = 100
  private _mass: number = 1
  private _body?: Matter.Rectangle
  private _static: boolean = false
  private _debugRectangle: PIXI.Graphics
  private _centerOfMass: PIXI.Graphics

  constructor() {
    super('Rigidbody2D')

    this._debugRectangle = new PIXI.Graphics()
    this._debugRectangle
      .setStrokeStyle({
        width: 1,
        color: 0xff0000
      })
      .rect(0, 0, this._width, this._height)
      .stroke()
    this._debugRectangle.visible = false

    this._centerOfMass = new PIXI.Graphics()
    this._centerOfMass
      .setFillStyle({
        color: 0x00ff00
      })
      .circle(0, 0, CENTER_OF_MASS_RADIUS)
      .fill()
    this._centerOfMass.visible = false
  }

  start() {
    super.start()

    this.transform.positionChangeCallback = this.handlePositionChange.bind(this)
    this._body = Matter.Bodies.rectangle(
      this.transform.position.x,
      this.transform.position.y,
      this._width,
      this._height,
      {
        isStatic: this._static,
        mass: this._mass
      }
    )

    Matter.Composite.add(this.game.physicsEngine.world, [this._body])

    this.game.app.stage.addChild(this._debugRectangle)
    this.game.app.stage.addChild(this._centerOfMass)
  }

  fixedUpdate(dt: number): void {
    super.fixedUpdate(dt)

    const newLocalPosition = new Vector3(
      this._body?.position.x,
      this._body?.position.y,
      this.transform.localPosition.z
    )

    this.transform.localPosition = this.transform.parent
      ? newLocalPosition.sub(this.transform.parent.position)
      : newLocalPosition

    this.transform.localRotation = new Vector3(0, (this._body?.angle * 180) / Math.PI, 0)

    this.updateDebugElements()
  }

  addForce(force: Vector3) {
    if (!this._body) {
      return
    }

    Matter.Body.applyForce(this._body, this._body.position, { x: force.x, y: force.y })
  }

  addForceAtPosition(force: Vector3, position: Vector3) {
    if (!this._body) {
      return
    }

    Matter.Body.applyForce(this._body, { x: position.x, y: position.y }, { x: force.x, y: force.y })
  }

  set debug(debug: boolean) {
    this._debugRectangle.visible = debug
    this._centerOfMass.visible = debug
  }

  set mass(mass: number) {
    this._mass = mass

    if (!this._body) {
      Matter.Body.setMass(this._body, mass)
    }
  }

  get mass() {
    return this._body?.mass || 0
  }

  get width() {
    return this._width
  }

  set width(width: number) {
    this._width = width
    this._debugRectangle.width = width
  }

  get height() {
    return this._height
  }

  set height(height: number) {
    this._height = height
    this._debugRectangle.height = height
  }

  get velocity() {
    if (!this._body) {
      return Vector3.Zero
    }

    return new Vector3(this._body.velocity.x, this._body.velocity.y, 0)
  }

  get angle() {
    if (!this._body) {
      return 0
    }

    return this._body.angle
  }

  destroy() {
    super.destroy()

    this.game.app.stage.removeChild(this._debugRectangle)
    this.game.app.stage.removeChild(this._centerOfMass)
  }

  private handlePositionChange() {
    if (!this._body) {
      return
    }

    this._body.position.x = this.transform.position.x
    this._body.position.y = this.transform.position.y
  }

  private updateDebugElements() {
    this._debugRectangle.position.set(
      this.transform.position.x - this._debugRectangle.width / 2,
      this.transform.position.y - this._debugRectangle.height / 2
    )

    this._centerOfMass.position.set(this._body?.position.x, this._body?.position.y)
  }
}

export { Rigidbody2D }
