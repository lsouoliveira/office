import { System } from './../system'

class Process {
  private readonly pid: number
  public system: System

  constructor(pid: number, system: System) {
    this.pid = pid
    this.system = system
  }

  create(pid: number, system: System) {
    return new Process(pid, system)
  }

  update(_: number) {}
  render(_: CanvasRenderingContext2D) {}

  onTerminate() {}

  getPid() {
    return this.pid
  }
}

export { Process }
