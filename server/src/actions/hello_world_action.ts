import { ActionHandler } from './action_handler'

class HelloWorldAction extends ActionHandler {
  async handle() {
    return {
      status: 200,
      body: {
        message: 'Hello, world!'
      }
    }
  }
}

export { HelloWorldAction }
