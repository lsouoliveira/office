import * as PIXI from 'pixi.js'
import { AnimatedSprite, Spritesheet } from 'pixi.js'
import { ComposedSpritesheet } from './../animation/spritesheet'
import { type Animator } from './../animation/animator'
import { PlayerMessage } from './../entities/player_message'
import { Emote } from './../entities/emote'
import { type Entity } from './../entities/entity'
import { createAnimatedSpriteFromTexture } from './../utils'
import { TILE_SIZE } from '../map/tile'
import { Vehicle } from './../vehicle'

enum Direction {
  North,
  South,
  East,
  West
}

enum State {
  Idle,
  Moving,
  Sitting
}

interface Target {
  x: number
  y: number
  direction: Direction
}

const LEVITATION_SPEED = 0.005
const LEVITATION_HEIGHT = 2

const lerp = (start: number, end: number, t: number) => {
  return start * (1 - t) + end * t
}

enum EquipmentType {
  Helmet,
  Wand,
  Glasses,
  FaceMask
}

class Equipment extends AnimatedSprite {
  public readonly id: string
  public readonly type: EquipmentType
  public readonly hideHair: boolean
  private animator?: Animator

  constructor(
    id: string,
    type: EquipmentType,
    hideHair: boolean,
    spriteSheet?: Spritesheet,
    textures?: PIXI.Texture[]
  ) {
    if (!spriteSheet && !textures) {
      throw new Error('Equipment must have a spriteSheet or textures')
    }

    super(spriteSheet?.animations?.idle_south || textures)

    this.id = id
    this.type = type
    this.hideHair = hideHair
  }

  init(animator: Animator) {
    this.animator = animator
  }

  getAnimator() {
    return this.animator
  }
}

class Player extends PIXI.Container implements Entity {
  public readonly id: string
  private animator: Animator
  private lastMessage: PlayerMessage
  private name: string
  private targets: Target[] = []
  private speed = 1
  private direction: Direction
  private isDrinking: boolean
  private isEating: boolean
  private helmetSlot?: Equipment
  private glassesSlot?: Equipment
  private faceMaskSlot?: Equipment
  private isSitting: boolean

  public playerName: PIXI.Text

  public topHalf: PIXI.Container
  public bottomHalf: PIXI.Container

  public topHalfSprite: PIXI.AnimatedSprite
  public bottomHalfSprite: PIXI.AnimatedSprite

  public rightHandSlot: PIXI.Container

  public shieldEffect: PIXI.AnimatedSprite

  private offsetX: number = 0
  private offsetY: number = 0

  private layers: PIXI.Container[]
  private movedUp: boolean = false

  private lastEmote?: Emote
  private isLevitating: boolean = false
  private levitationOffset: number = 0

  private isHiding: boolean

  private vehicle?: Vehicle
  private isDriving: boolean = false

  constructor(id: string, composedSpritesheet: ComposedSpritesheet, layers: PIXI.Container[]) {
    super()

    this.id = id
    this.layers = layers

    this.topHalf = new PIXI.Container()
    this.topHalf.zIndex = 2
    this.topHalf.sortableChildren = true

    this.bottomHalf = new PIXI.Container()
    this.bottomHalf.zIndex = 1
    this.bottomHalf.sortableChildren = true

    this.rightHandSlot = new PIXI.Container()

    this.topHalfSprite = new PIXI.AnimatedSprite(
      composedSpritesheet.getTextures('idle_south', 0, 0) || []
    )
    this.bottomHalfSprite = new PIXI.AnimatedSprite(
      composedSpritesheet.getTextures('idle_south', 0, 0) || []
    )

    this.playerName = new PIXI.Text('', {
      fontFamily: 'Arial',
      fontSize: 256,
      fill: 0x00ff00,
      stroke: 0x000000,
      strokeThickness: 32
    })
    this.playerName.scale.set(24 / 256)
    this.playerName.anchor.set(0.5, 0)
    this.playerName.zIndex = 1

    this.shieldEffect = createAnimatedSpriteFromTexture('blue_effects.png', 122, 1, 1, 16, 4)
    this.shieldEffect.anchor.set(0.5, 0.5)
    this.shieldEffect.animationSpeed = 0.1
    this.shieldEffect.play()
    this.shieldEffect.width = TILE_SIZE
    this.shieldEffect.height = TILE_SIZE
    this.shieldEffect.visible = false

    this.topHalf.addChild(this.topHalfSprite)
    this.bottomHalf.addChild(this.bottomHalfSprite)
  }

  init(animator: Animator) {
    this.animator = animator
  }

  onStart() {}

  getName() {
    return this.name
  }

  say(message: string, color: string, compact: boolean) {
    if (this.lastMessage) {
      this.lastMessage.destroy()
    }

    this.lastMessage = PlayerMessage.show(this, message, color, compact)

    return this.lastMessage
  }

  updateEntity(dt: number) {
    try {
      this.moveToNextTarget(dt)

      this.bottomHalf.position.set(this.position.x, this.position.y)
      this.topHalf.position.set(this.position.x, this.position.y - this.topHalfSprite.height)

      this.playerName.position.set(
        this.position.x + this.topHalfSprite.width / 2,
        this.position.y - this.topHalfSprite.height - 2
      )

      this.lastEmote?.position?.set(
        this.position.x + this.topHalfSprite.width / 2 - TILE_SIZE / 2,
        this.position.y - this.topHalfSprite.height - TILE_SIZE
      )

      this.rightHandSlot.position.set(
        this.playerName.position.x + this.getPlayerNameWidth() / 2 + TILE_SIZE / 4,
        this.playerName.position.y
      )

      this.shieldEffect.position.set(
        this.position.x + TILE_SIZE / 2,
        this.position.y + TILE_SIZE / 2
      )

      if (this.isLevitating) {
        this.levitationOffset = Math.sin(LEVITATION_SPEED * Date.now()) * LEVITATION_HEIGHT
        this.topHalf.pivot.set(0, 4 * LEVITATION_HEIGHT + this.levitationOffset)
        this.bottomHalf.pivot.set(0, 4 * LEVITATION_HEIGHT + this.levitationOffset)
      } else {
        this.levitationOffset = 0
        this.topHalf.pivot.set(0, 0)
        this.bottomHalf.pivot.set(0, 0)
      }

      this.topHalfSprite.visible =
        !this.isDriving && !this.isHiding && (!this.helmetSlot || !this.helmetSlot.hideHair)
      this.bottomHalf.visible = !this.isHiding
      this.bottomHalfSprite.visible = !this.isDriving

      const items = [this.helmetSlot, this.glassesSlot, this.faceMaskSlot]

      items.forEach((item) => {
        if (item) {
          item.visible = !this.isDriving
        }
      })
    } catch (e) {
      console.debug(e)
    }
  }

  moveToNextTarget(dt: number) {
    if (this.hasTargets()) {
      const target = this.targets[0]

      this.direction = target.direction

      if (this.moveToPoint(target.x * TILE_SIZE, target.y * TILE_SIZE, dt)) {
        this.targets.shift()
      } else {
        this.playWalkAnimation()
      }
    } else {
      this.playIdleAnimation()
    }
  }

  playWalkAnimation() {
    this.playAnimation('walk')
  }

  playIdleAnimation() {
    if (this.isSitting) {
      return
    }

    if (this.isDrinking && this.direction == Direction.South) {
      this.playAnimation('drink')

      return
    }

    if (this.isEating && this.direction == Direction.South) {
      this.playAnimation('eat')

      return
    }

    return this.playAnimation('idle')
  }

  playAnimation(animation: string) {
    const items = [this.helmetSlot, this.glassesSlot, this.faceMaskSlot]

    switch (this.direction) {
      case Direction.North:
        this.animator.play(animation + '_north')
        items.forEach((item) => item?.getAnimator()?.play(animation + '_north'))
        break
      case Direction.South:
        this.animator.play(animation + '_south')
        items.forEach((item) => item?.getAnimator()?.play(animation + '_south'))
        break
      case Direction.East:
        this.animator.play(animation + '_east')
        items.forEach((item) => item?.getAnimator()?.play(animation + '_east'))
        break
      case Direction.West:
        this.animator.play(animation + '_west')
        items.forEach((item) => item?.getAnimator()?.play(animation + '_west'))
        break
    }

    this.updateVehicle()
  }

  moveToPoint(x, y, dt) {
    const dx = x - this.position.x
    const dy = y - this.position.y

    const distance = Math.sqrt(dx ** 2 + dy ** 2)

    if (distance === 0) {
      return true
    }

    const t = Math.min(1, (this.speed * dt) / distance)

    this.position.x = lerp(this.position.x, x, t)
    this.position.y = lerp(this.position.y, y, t)

    if (distance < 1) {
      this.position.x = x
      this.position.y = y

      return true
    }

    return false
  }

  updateData(data: any) {
    if (!this.hasTargets() || !this.canReach(data.position)) {
      this.clearTargets()
      this.position.set(data.position.x, data.position.y)
      this.pivot.set(0, 0)
      this.moveDown()
      this.show()
    }

    this.direction = data.direction
    this.speed = data.speed
    this.isDrinking = data.isDrinking
    this.isEating = data.isEating
    this.isSitting = data.state == State.Sitting
    this.isLevitating = data.isLevitating

    if (data.isPatronoActive) {
      this.setName(`${data.name} ${data.patrono}`)
    } else {
      this.setName(data.name)
    }

    if (data.isProtegoActive) {
      this.shieldEffect.visible = true
    } else {
      this.shieldEffect.visible = false
    }

    if (data.state == State.Sitting) {
      this.clearTargets()
      this.sit(data.position.x, data.position.y, data.direction)
    } else if (!this.hasTargets()) {
      this.playIdleAnimation()
    }
  }

  sit(x: number, y: number, facing: Direction) {
    this.clearTargets()

    switch (facing) {
      case Direction.North:
        this.playAnimation('idle')
        this.hide()
        break
      case Direction.West:
        this.playAnimation('sit')
        this.offsetY = -20
        break
      case Direction.East:
        this.playAnimation('sit')
        this.offsetY = -20
        break
      case Direction.South:
        if (this.isDrinking) {
          this.playAnimation('drink')
        } else if (this.isEating) {
          this.playAnimation('eat')
        } else {
          this.playAnimation('idle')
        }
        this.offsetY = -4
        break
    }

    this.position.set(x + this.offsetX, y + this.offsetY)
    this.moveUp()
  }

  moveUp() {
    if (this.movedUp) {
      return
    }

    this.layers[1].removeChild(this.bottomHalf)
    this.layers[2].addChild(this.bottomHalf)
    this.movedUp = true
  }

  moveDown() {
    if (!this.movedUp) {
      return
    }

    this.layers[2].removeChild(this.bottomHalf)
    this.layers[1].addChild(this.bottomHalf)
    this.movedUp = false
  }

  show() {
    this.isHiding = false
  }

  hide() {
    this.isHiding = true
  }

  moveTo(x: number, y: number, direction: Direction) {
    this.position.set(this.position.x - this.offsetX, this.position.y - this.offsetY)
    this.offsetX = 0
    this.offsetY = 0

    this.show()
    this.moveDown()

    this.targets.push({ x, y, direction })
    this.isSitting = false
  }

  setName(name: string) {
    this.name = name
    this.playerName.text = name
  }

  hasTargets() {
    return this.targets.length > 0
  }

  canReach(position: { x: number; y: number }) {
    const tileX = Math.floor(position.x / TILE_SIZE)
    const tileY = Math.floor(position.y / TILE_SIZE)

    if (this.getTileX() == tileX && this.getTileY() == tileY) {
      return true
    }

    return this.targets.some((target) => target.x == tileX && target.y == tileY)
  }

  getTileX() {
    return Math.floor(this.position.x / TILE_SIZE)
  }

  getTileY() {
    return Math.floor(this.position.y / TILE_SIZE)
  }

  clearTargets() {
    this.targets = []
  }

  clear() {
    this.playerName.destroy()
    this.topHalf.destroy()
    this.bottomHalf.destroy()
    this.shieldEffect.destroy()
    this.rightHandSlot.destroy()
  }

  setAnimator(animator: Animator) {
    this.animator = animator
  }

  equip(equipment: Equipment) {
    switch (equipment.type) {
      case EquipmentType.Helmet:
        if (this.helmetSlot) {
          this.topHalf.removeChild(this.helmetSlot)
        }

        this.helmetSlot = equipment
        equipment.zIndex = 3
        break
      case EquipmentType.Glasses:
        if (this.glassesSlot) {
          this.topHalf.removeChild(this.glassesSlot)
        }

        this.glassesSlot = equipment
        equipment.zIndex = 2
        break
      case EquipmentType.FaceMask:
        if (this.faceMaskSlot) {
          this.topHalf.removeChild(this.faceMaskSlot)
        }

        this.faceMaskSlot = equipment
        equipment.zIndex = 1
        break
      case EquipmentType.Wand:
        if (this.rightHandSlot.children.length > 0) {
          this.rightHandSlot.removeChildren()
        }

        this.rightHandSlot.addChild(equipment)
      default:
        return
    }

    this.topHalf.addChild(equipment)
  }

  unequip(equipment: Equipment) {
    switch (equipment.type) {
      case EquipmentType.Helmet:
        if (this.helmetSlot?.id === equipment.id) {
          this.helmetSlot = undefined
        }
        break
      case EquipmentType.Glasses:
        if (this.glassesSlot?.id === equipment.id) {
          this.glassesSlot = undefined
        }
        break
      case EquipmentType.FaceMask:
        if (this.faceMaskSlot?.id === equipment.id) {
          this.faceMaskSlot = undefined
        }
        break
      case EquipmentType.Wand:
        if (this.rightHandSlot?.children[0] === equipment) {
          this.rightHandSlot.removeChildren()
        }
        break
      default:
        return
    }

    this.topHalf.removeChild(equipment)
  }

  getPlayerNameWidth() {
    const style = new PIXI.TextStyle({
      fontFamily: 'Arial',
      fontSize: 256,
      fill: 0x00ff00,
      stroke: 0x000000,
      strokeThickness: 32
    })

    return PIXI.CanvasTextMetrics.measureText(this.name, style).width * (24 / 256)
  }

  getHelmet() {
    return this.helmetSlot
  }

  getGlasses() {
    return this.glassesSlot
  }

  getFaceMask() {
    return this.faceMaskSlot
  }

  getRightHand() {
    return this.rightHandSlot.children[0] as Equipment
  }

  emote(emote: Emote) {
    this.lastEmote?.destroy()

    this.lastEmote = emote
    this.lastEmote.zIndex = 2

    emote.on('destroy', () => {
      this.lastEmote = undefined
    })
  }

  canEmote(id: string) {
    return this.lastEmote?.getID() != id
  }

  drive(vehicle: Vehicle) {
    this.exitVehicle()

    this.vehicle = vehicle
    this.isDriving = true
    this.bottomHalf.addChild(vehicle.sprite)

    this.updateVehicle()
  }

  exitVehicle() {
    if (!this.vehicle) {
      return
    }

    this.bottomHalf.removeChild(this.vehicle.sprite)
    this.vehicle = undefined
    this.isDriving = false
  }

  updateVehicle() {
    if (!this.vehicle) {
      return
    }

    switch (this.direction) {
      case Direction.North:
        this.vehicle.turnNorth()
        break
      case Direction.South:
        this.vehicle.turnSouth()
        break
      case Direction.East:
        this.vehicle.turnEast()
        break
      case Direction.West:
        this.vehicle.turnWest()
        break
    }
  }
}

export { Player, Direction, Equipment, EquipmentType }
