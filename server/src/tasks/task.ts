class Task {
  private done: boolean = false

  perform() {
    if (this.isDone()) {
      return
    }

    this._perform()
  }

  _perform() {
    throw new Error('Not implemented')
  }

  isDone() {
    return this.done
  }

  markAsDone() {
    this.done = true
  }
}

export { Task }
