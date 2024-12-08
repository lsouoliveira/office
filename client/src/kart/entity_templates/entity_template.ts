import { Entity } from '../entities/entity'

class EntityTemplate {
  build(): Entity {
    throw new Error('Not Implemented')
  }
}

export { EntityTemplate }
