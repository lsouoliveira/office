import { System } from './../system'
import { Process } from './process'

class ProcessManager {
  private system: System
  private processes: Map<number, Process> = new Map()
  private pid_counter: number = 0

  constructor(system: System) {
    this.system = system
  }

  update(dt: number) {
    this.processes.forEach((process) => process.update(dt))
  }

  render(context: CanvasRenderingContext2D) {
    this.processes.forEach((process) => process.render(context))
  }

  launch(process_class: any) {
    const pid = this.generatePid()
    const process = new process_class(pid, this.system)

    this.processes.set(pid, process)
    process.onStart()
  }

  terminate(pid: number) {
    const process = this.processes.get(pid)

    if (!process) {
      return
    }

    process.onTerminate()

    this.processes.delete(pid)
  }

  private generatePid() {
    return this.pid_counter++
  }
}

export { ProcessManager }
