class EventEmitter {
  private events: { [key: string]: Function[] } = {}

  on(event: string, callback: Function) {
    if (!this.events[event]) {
      this.events[event] = []
    }

    this.events[event].push(callback)
  }

  emit(event: string, ...args: any[]) {
    const callbacks = this.events[event]

    if (callbacks) {
      callbacks.forEach((callback) => {
        callback(...args)
      })
    }
  }
}

export { EventEmitter }
