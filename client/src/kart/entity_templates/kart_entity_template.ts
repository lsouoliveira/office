import { EntityTemplate } from './entity_template'
import { Entity } from '../entities/entity'
import { SpriteComponent, CarComponent, Rigidbody2D } from '../components'
import * as PIXI from 'pixi.js'
import { Vector3 } from '../utils/vector3'

class KartEntityTemplate extends EntityTemplate {
  build(): Entity {
    const entity = new Entity()

    const kartTexture = PIXI.Assets.get('red_kart.png')

    const spriteComponent = new SpriteComponent(kartTexture)
    spriteComponent.sprite.anchor.set(0.5, 0.5)
    spriteComponent.sprite.scale.set(0.5)
    spriteComponent.sprite.width = 160
    spriteComponent.sprite.height = 229

    const carComponent = new CarComponent()
    carComponent.debug = true

    const rigidbody = new Rigidbody2D()
    rigidbody.width = 160
    rigidbody.height = 229
    rigidbody.debug = true

    entity.addComponent(spriteComponent)
    entity.addComponent(carComponent)
    entity.addComponent(rigidbody)

    entity.transform.position = new Vector3(400, 400, 0)

    return entity
  }
}

export { KartEntityTemplate }
