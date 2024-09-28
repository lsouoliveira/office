import { System } from './system.ts'
import { Startup } from './programs/startup.ts'

class OSApplication {
  private system: System

  constructor(root: HTMLElement) {
    this.system = new System(root)
  }

  start() {
    this.system.init()
    this.system.start()
    this.system.launch(Startup)
  }
}

export { OSApplication }
