class Vector3 {
  static Zero = new Vector3(0, 0, 0)

  public x: number
  public y: number
  public z: number

  constructor(x: number, y: number, z: number) {
    this.x = x
    this.y = y
    this.z = z
  }

  magnitude() {
    return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2)
  }

  resultant() {
    return this.x + this.y + this.z
  }

  unit() {
    return this.resultant() / this.magnitude()
  }

  add(v: Vector3) {
    return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z)
  }

  sub(v: Vector3) {
    return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z)
  }

  scale(s: number) {
    return new Vector3(this.x * s, this.y * s, this.z * s)
  }

  clone() {
    return new Vector3(this.x, this.y, this.z)
  }
}

export { Vector3 }
