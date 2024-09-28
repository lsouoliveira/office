import { EventEmitter } from './../../event_emitter'

type WidgetPosition = {
  x: number
  y: number
}

type WidgetStyle = {
  backgroundColor: string
}

const defaultWidgetStyle: WidgetStyle = {
  backgroundColor: 'transparent'
}

class Widget extends EventEmitter {
  private parent?: Widget
  private position: WidgetPosition = { x: 0, y: 0 }
  private width: number = 0
  private height: number = 0
  private children: Widget[] = []
  private hasFocus: boolean = false
  public style: WidgetStyle

  constructor(widgetStyle = { ...defaultWidgetStyle }) {
    super()

    this.style = widgetStyle
  }

  resize(width: number, height: number) {
    this.width = width
    this.height = height
  }

  getPosition() {
    return this.position
  }

  setPosition(x: number, y: number) {
    this.position.x = x
    this.position.y = y
  }

  getWidgetSize() {
    return {
      width: this.width,
      height: this.height
    }
  }

  getParent() {
    return this.parent
  }

  setParent(parent: Widget) {
    this.parent = parent
  }

  addChild(child: Widget) {
    child.setParent(this)
    this.children.push(child)
  }

  removeChild(child: Widget) {
    const index = this.children.indexOf(child)

    if (index !== -1) {
      this.children.splice(index, 1)
    }
  }

  update(dt: number) {
    this.children.forEach((child) => {
      child.update(dt)
    })
  }

  contains(x: number, y: number) {
    return (
      x >= this.getOffset().x &&
      x <= this.getOffset().x + this.getWidgetSize().width &&
      y >= this.getOffset().y &&
      y <= this.getOffset().y + this.getWidgetSize().height
    )
  }

  onMouseDown(x: number, y: number) {
    if (!this.contains(x, y)) {
      return
    }

    for (const child of this.children.reverse()) {
      if (child.contains(x, y)) {
        child.onMouseDown(x, y)
      }
    }

    this.emit('mousedown', x, y)
  }

  onMouseUp(x: number, y: number) {
    if (!this.contains(x, y) || !this.hasFocus) {
      return
    }

    for (const child of this.children.reverse()) {
      if (child.contains(x, y)) {
        child.onMouseUp(x, y)
      }
    }

    this.emit('mouseup', x, y)
  }

  onMouseMove(x: number, y: number) {
    if (!this.contains(x, y) || !this.hasFocus) {
      return
    }

    for (const child of this.children.reverse()) {
      if (child.contains(x, y)) {
        child.onMouseMove(x, y)
      }
    }

    this.emit('mousemove', x, y)
  }

  onDoubleClick(x: number, y: number) {
    if (!this.contains(x, y)) {
      return
    }

    for (const child of this.children.reverse()) {
      if (child.contains(x, y)) {
        child.onDoubleClick(x, y)
      }
    }

    this.emit('doubleclick', x, y)
  }

  onKeyPress(key: string) {
    this.emit('keypress', key)
  }

  onKeyUp(key: string) {
    this.emit('keyup', key)
  }

  clearFocus() {
    this.hasFocus = false
  }

  getInternalOffset() {
    const parentX = this.parent ? this.parent.getInternalOffset().x : 0
    const parentY = this.parent ? this.parent.getInternalOffset().y : 0

    return {
      x: this.position.x + parentX,
      y: this.position.y + parentY
    }
  }

  focused() {
    return this.hasFocus
  }

  getOffset() {
    const parentX = this.parent ? this.parent.getInternalOffset().x : 0
    const parentY = this.parent ? this.parent.getInternalOffset().y : 0

    return {
      x: this.position.x + parentX,
      y: this.position.y + parentY
    }
  }

  render(context: CanvasRenderingContext2D) {
    this.renderWidget(context)

    this.children.forEach((child) => {
      child.render(context)
    })
  }

  renderWidget(context: CanvasRenderingContext2D) {
    context.fillStyle = this.style.backgroundColor
    context.fillRect(this.getOffset().x, this.getOffset().y, this.width, this.height)
  }
}

export { Widget }
