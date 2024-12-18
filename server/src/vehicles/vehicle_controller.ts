import { Player, PlayerMovement, PlayerData, Direction } from '../player'
import { EQUIPMENTS } from './../world'
import { Item } from './../items/item'
import { TILE_SIZE } from './../config'

class VehicleController {
  private player: Player
  private movement: PlayerMovement
  private playerData: PlayerData

  constructor(player: Player) {
    this.player = player
    this.movement = player.movement
    this.playerData = player.playerData
  }

  exitVehicle() {
    const vehicle = this.playerData.vehicle

    if (!vehicle) {
      return
    }

    const map = this.movement.getMap()

    let tileX = this.movement.gridX()
    let tileY = this.movement.gridY()

    if (map.contains(tileX, tileY)) {
      const equipment = this.findEquipmentForVehicle(vehicle)

      if (!equipment || !equipment.directions) {
        return
      }

      vehicle.getType().setId(equipment.directions[this.playerData.direction])

      this.removeVehicleFromPlayer(vehicle)
      this.placeVehicleNextToPlayer(vehicle, tileX, tileY)
      this.positionPlayerNextToVehicle(tileX, tileY)

      this.player.emit('item:added', { item: vehicle, tileX, tileY })
    }
  }

  private findEquipmentForVehicle(vehicle: Item) {
    return EQUIPMENTS.find((equipment) => equipment.id == vehicle.getType().getEquipmentId())
  }

  private placeVehicleNextToPlayer(vehicle: Item, tileX: number, tileY: number) {
    const tile = this.movement.getMap().getTile(tileX, tileY)
    tile.addItem(vehicle)
  }

  private removeVehicleFromPlayer(vehicle: Item) {
    this.playerData.vehicle = undefined
    this.player.getInventory().removeItem(vehicle)
  }

  private positionPlayerNextToVehicle(tileX: number, tileY: number) {
    this.player.clearTasks()
    this.player.movement.stop()

    switch (this.playerData.direction) {
      case Direction.North:
        this.playerData.position.x = (tileX - 1) * TILE_SIZE
        this.playerData.position.y = tileY * TILE_SIZE
        break
      case Direction.South:
        this.playerData.position.x = (tileX + 1) * TILE_SIZE
        this.playerData.position.y = tileY * TILE_SIZE
        break
      case Direction.East:
        this.playerData.position.x = tileX * TILE_SIZE
        this.playerData.position.y = tileY * TILE_SIZE
        break
      case Direction.West:
        this.playerData.position.x = tileX * TILE_SIZE
        this.playerData.position.y = (tileY + 1) * TILE_SIZE
        break
    }
  }
}

export { VehicleController }
