import { House } from './house'
import { Player } from '../player'
import { db } from '../db'
import { Result, Errors } from '../utils'
import { housesTable } from '../db/schema'
import { eq } from 'drizzle-orm'

class HousingSystem {
  private _houses: Record<number, House>

  constructor() {
    this._houses = {}
  }

  async buyHouse(houseId: string, buyer: Player) {
    const house = this._houses[houseId]

    if (!house) {
      return Result.fail(Errors.General.notFound())
    }

    if (!house.hasOwner()) {
      return Result.fail(Errors.Housing.alreadyHasOwner())
    }

    if (buyer.getMoney() < house.price) {
      return Result.fail(Errors.Housing.insufficientFunds())
    }

    buyer.addMoney(-house.price)
    await db.update(housesTable).set({ ownerId: buyer.getId() }).where(eq(housesTable.id, house.id))

    house.ownerId = buyer.getId()

    return Result.ok()
  }

  doesPlayerOwnsHouse(playerId: string, houseId: string) {
    const house = this._houses[houseId]

    return house && house.ownerId === playerId
  }

  async loadHouses() {
    const houses = await db.query.housesTable.findMany()

    houses.forEach((houseData) => {
      const { id, price, ownerId } = houseData

      const house = new House({
        id,
        price,
        ownerId
      })

      this._houses[id] = house
    })
  }
}

export { HousingSystem }
