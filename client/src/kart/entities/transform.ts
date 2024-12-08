import { Vector3 } from '../utils/vector3'
import { Entity } from '../entities/entity'

class Transform {
  private _parent?: Transform

  children: Transform[] = []

  localPosition: Vector3
  localRotation: Vector3
  localScale: Vector3
  entity: Entity
  positionChangeCallback?: () => void

  constructor(entity: Entity) {
    this.localPosition = Vector3.Zero
    this.localRotation = Vector3.Zero
    this.localScale = Vector3.Zero
    this.entity = entity
  }

  get parent(): Transform | undefined {
    return this._parent
  }

  set parent(transform: Transform | undefined) {
    if (transform) {
      this._parent = transform
      this.children.push(transform)

      return
    }

    this._parent = undefined
    this.children = this.children.filter((c) => c != transform)
  }

  set position(position: Vector3) {
    if (this.parent) {
      this.localPosition = position.sub(this.parent.position)

      return
    }

    this.localPosition = position.clone()

    this.positionChangeCallback?.()
  }

  get position() {
    if (!this.parent) {
      return this.localPosition.clone()
    }

    return this.parent.position.add(this.localPosition)
  }
}

export { Transform }
