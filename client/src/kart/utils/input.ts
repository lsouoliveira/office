class Input {
  private keyStates: Map<string, boolean> = new Map()
  private mouseStates: Map<number, boolean> = new Map()

  setup() {
    window.addEventListener('keydown', (event) => {
      this.keyStates.set(event.key, true)
    })

    window.addEventListener('keyup', (event) => {
      this.keyStates.set(event.key, false)
    })

    window.addEventListener('mousedown', (event) => {
      this.mouseStates.set(event.button, true)
    })

    window.addEventListener('mouseup', (event) => {
      this.mouseStates.set(event.button, false)
    })
  }

  teardown() {
    window.removeEventListener('keydown', (event) => {
      this.keyStates.set(event.key, true)
    })

    window.removeEventListener('keyup', (event) => {
      this.keyStates.set(event.key, false)
    })

    window.removeEventListener('mousedown', (event) => {
      this.mouseStates.set(event.button, true)
    })

    window.removeEventListener('mouseup', (event) => {
      this.mouseStates.set(event.button, false)
    })
  }

  getKeyDown(key: string): boolean {
    return this.keyStates.get(key) || false
  }

  getMouseDown(button: number): boolean {
    return this.mouseStates.get(button) || false
  }

  getMouseUp(button: number): boolean {
    return !this.mouseStates.get(button) || false
  }

  getMousePosition(): [number, number] {
    return [0, 0]
  }
}

export { Input }
