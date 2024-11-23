import * as crypto from 'crypto'

class Projectile {
  id: string
  name: string
  position: { x: number; y: number }
  direction: { x: number; y: number }
  speed: number
  duration: number
  timer: number
  onTimerEnd: Array<(projectile: Projectile) => void>

  constructor(
    name: string,
    position: { x: number; y: number },
    direction: { x: number; y: number },
    speed: number,
    duration: number,
    id?: string
  ) {
    this.name = name
    this.id = id || crypto.randomUUID()
    this.position = position
    this.direction = direction
    this.speed = speed
    this.duration = duration
    this.timer = 0
    this.direction = direction
    this.onTimerEnd = []
  }

  get Id() {
    return this.id
  }

  get Position() {
    return this.position
  }

  get Speed() {
    return this.speed
  }

  get Duration() {
    return this.duration
  }

  update(dt: number) {
    this.position.x += this.direction.x * this.speed * dt
    this.position.y += this.direction.y * this.speed * dt

    this.timer += dt

    if (this.timer >= this.duration) {
      this.onTimerEnd.forEach((cb) => cb(this))
    }
  }

  destroy() {
    this.onTimerEnd.forEach((cb) => cb(this))
  }

  addOnTimerEnd(cb: (projectile: Projectile) => void) {
    this.onTimerEnd.push(cb)
  }

  onHit(target: any) {}

  toData() {
    return {
      id: this.id,
      name: this.name,
      position: this.position,
      direction: this.direction,
      speed: this.speed,
      duration: this.duration,
      timer: this.timer,
      timestamp: Date.now()
    }
  }
}

export default Projectile