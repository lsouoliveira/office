import { Vector3 } from '../utils/vector3'
import { Component } from './component'
import { Rigidbody2D } from './'
import * as Tone from 'tone'
import { GRAVITY } from '../utils/constants'
import * as PIXI from 'pixi.js'

const ENGINE_RPM_RATE = 10000
const MAX_ENGINE_RPM = 10000
const DEBUG_AXLE_HEIGHT = 10

class CarComponent extends Component {
  mass: number = 1200

  width: number = 160
  height: number = 229

  cgToFront: number = 80
  cgToRear: number = 80
  cgToFrontAxle: number = 55
  cgToRearAxle: number = 65
  cgHeight: number = 0.55

  wheelRadius: number = 0.3
  tireGrip: number = 2.0
  lockGrip: number = 0.7

  engineForce: number = 8000
  brakeForce: number = 12000
  eBrakeForce: number = 4800

  weightTransfer: number = 0.2

  maxSteer: number = 2 * Math.PI

  cornerStiffnessFront: number = 5.0
  cornerStiffnessRear: number = 5.2

  airResistance: number = 2.5
  rollResistance: number = 8

  inertia: number = 0
  wheelBase: number = 0
  axleWeightRatioFront: number = 0
  axleWeightRatioRear: number = 0

  localAcceleration: Vector3 = Vector3.Zero

  private rigidbody?: Rigidbody2D

  private engineAudio?: Tone.Player
  private pitchShift?: Tone.PitchShift
  private engineRPM: number = 1000

  private _debug: boolean = false
  private frontAxleDebug?: PIXI.Graphics
  private rearAxleDebug?: PIXI.Graphics

  constructor() {
    super('CarComponent')
  }

  start() {
    super.start()

    this.rigidbody = this.getComponent('Rigidbody2D') as Rigidbody2D

    this.setupAudio()
    this.setupDebugGraphics()

    this.inertia = this.mass
    this.wheelBase = this.cgToFrontAxle + this.cgToRearAxle
    this.axleWeightRatioFront = this.cgToFrontAxle / this.wheelBase
    this.axleWeightRatioRear = this.cgToRearAxle / this.wheelBase
  }

  update(dt: number) {
    this.updateEngineAudio(dt)
    this.updateDebugGraphics()
  }

  fixedUpdate(dt: number): void {
    this.applyPhysics(dt)
  }

  updateEngineAudio(dt: number) {
    if (this.game.input.getKeyDown('w')) {
      this.engineRPM += ENGINE_RPM_RATE * dt
    } else {
      this.engineRPM -= ENGINE_RPM_RATE * dt
    }

    this.engineRPM = Math.min(MAX_ENGINE_RPM, Math.max(1000, this.engineRPM))

    if (this.pitchShift) {
      this.pitchShift.pitch = 1 + 20 * ((this.engineRPM - 1000) / MAX_ENGINE_RPM)
    }
  }

  destroy() {
    super.destroy()

    if (this.frontAxleDebug) {
      this.game.app.stage.removeChild(this.frontAxleDebug)
    }

    if (this.rearAxleDebug) {
      this.game.app.stage.removeChild(this.rearAxleDebug)
    }
  }

  set debug(debug: boolean) {
    this._debug = debug

    if (this.frontAxleDebug) {
      this.frontAxleDebug.visible = this._debug
    }

    if (this.rearAxleDebug) {
      this.rearAxleDebug.visible = this._debug
    }
  }

  private setupAudio() {
    const pitchShift = new Tone.PitchShift().toDestination()
    this.engineAudio = new Tone.Player('resources/engine.mp3').connect(pitchShift)
    this.engineAudio.loop = true
    this.engineAudio.autostart = false
    this.pitchShift = pitchShift
  }

  private setupDebugGraphics() {
    this.frontAxleDebug = new PIXI.Graphics()
    this.frontAxleDebug.setFillStyle(0xff0000).rect(0, 0, this.width, DEBUG_AXLE_HEIGHT).fill()
    this.frontAxleDebug.visible = this._debug

    this.rearAxleDebug = new PIXI.Graphics()
    this.rearAxleDebug.setFillStyle(0xff0000).rect(0, 0, this.width, DEBUG_AXLE_HEIGHT).fill()
    this.rearAxleDebug.visible = this._debug

    this.game.app.stage.addChild(this.frontAxleDebug)
    this.game.app.stage.addChild(this.rearAxleDebug)
  }

  private updateDebugGraphics() {
    if (this.frontAxleDebug) {
      this.frontAxleDebug.position.set(
        this.transform.position.x - this.width / 2,
        this.transform.position.y - DEBUG_AXLE_HEIGHT / 2 - this.cgToFrontAxle
      )
    }

    if (this.rearAxleDebug) {
      this.rearAxleDebug.position.set(
        this.transform.position.x - this.width / 2,
        this.transform.position.y - DEBUG_AXLE_HEIGHT / 2 + this.cgToRearAxle
      )
    }
  }

  private applyPhysics(dt: number) {
    if (!this.rigidbody) {
      return
    }

    const velocityX = Math.cos(this.rigidbody.angle)
    const velocityY = Math.sin(this.rigidbody.angle)

    const localVelocity = new Vector3(
      velocityX * this.rigidbody.velocity.x + velocityY * this.rigidbody.velocity.y,
      velocityX * this.rigidbody.velocity.y - velocityY * this.rigidbody.velocity.x,
      0
    )

    // Weight on axles based on centre of gravity and weight shift due to forward/reverse acceleration
    const axleWeightFront =
      this.mass *
      (this.axleWeightRatioFront * GRAVITY -
        (this.weightTransfer * this.localAcceleration.x * this.cgHeight) / this.wheelBase)
    const axleWeightRear =
      this.mass *
      (this.axleWeightRatioRear * GRAVITY +
        (this.weightTransfer * this.localAcceleration.x * this.cgHeight) / this.wheelBase)
  }
}

export { CarComponent }
