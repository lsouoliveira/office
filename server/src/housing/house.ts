class House {
  id: number
  price: number
  ownerId?: string

  constructor({ id, price, ownerId }) {
    this.id = id
    this.price = price
    this.ownerId = ownerId
  }
}

export { House }
