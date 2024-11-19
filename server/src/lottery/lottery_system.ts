import { Player } from '../player'
import { World } from '../world'
import { Result, Errors } from '../utils'
import { db } from '../db'
import { lotteryResultsTable, lotteryResultWinnersTable } from '../db/schema'
import { eq, desc } from 'drizzle-orm'

class Ticket {
  private number: number
  private playerId: string
  private playerName: string

  constructor(number: number, playerId: string, playerName: string) {
    this.number = number
    this.playerId = playerId
    this.playerName = playerName
  }

  getNumber() {
    return this.number
  }

  getPlayerId() {
    return this.playerId
  }

  getPlayerName() {
    return this.playerName
  }
}

const BASE_TICKET_PRICE = 10

class LotterySystem {
  private prizePool: number
  private basePrizePool: number
  private tickets: Ticket[]
  private world: World

  constructor(world: World, prizePool: number) {
    this.basePrizePool = prizePool
    this.prizePool = prizePool
    this.tickets = []
    this.world = world
  }

  buyTicket(player: Player, number: number) {
    const foundPlayerTicket = this.tickets.find((ticket) => ticket.getPlayerId() === player.getId())

    if (foundPlayerTicket) {
      return Result.fail(Errors.Lottery.playerAlreadyHasTicket())
    }

    if (player.getMoney() < BASE_TICKET_PRICE) {
      return Result.fail(Errors.Lottery.notEnoughMoney())
    }

    player.addMoney(-BASE_TICKET_PRICE)
    this.prizePool += BASE_TICKET_PRICE

    const ticket = new Ticket(number, player.getId(), player.getName())

    this.tickets.push(ticket)

    return Result.ok()
  }

  async drawWinner() {
    const winningNumber = Math.floor(Math.random() * 16) + 1
    const winningTickets = this.tickets.filter((ticket) => ticket.getNumber() === winningNumber)

    for (const ticket of winningTickets) {
      const player = this.world.getPlayerById(ticket.getPlayerId())

      if (player) {
        player.addMoney(this.prizePool / winningTickets.length)
      }
    }

    await this.saveResult(winningNumber, winningTickets, this.prizePool)

    this.setupNextRound()
  }

  getLastNthResults(n: number) {
    return db.query.lotteryResultsTable.findMany({
      with: { winners: true },
      orderBy: [desc(lotteryResultsTable.id)],
      limit: n
    })
  }

  setupNextRound() {
    this.prizePool = this.basePrizePool
    this.tickets = []
  }

  getPlayerTicketByPlayerId(playerId: string) {
    return this.tickets.find((ticket) => ticket.getPlayerId() === playerId)
  }

  getPrizePool() {
    return this.prizePool
  }

  private async saveResult(winnerNumber: number, winningTickets: Ticket[], prizePool: number) {
    const result = await db
      .insert(lotteryResultsTable)
      .values({ prize: prizePool, number: winnerNumber })
      .returning({ id: lotteryResultsTable.id })

    const prize = prizePool / winningTickets.length

    for (const ticket of winningTickets) {
      await db
        .insert(lotteryResultWinnersTable)
        .values({
          lottery_result_id: result[0].id,
          prize: prize,
          player_id: ticket.getPlayerId(),
          player_name: ticket.getPlayerName()
        })
        .execute()
    }
  }
}

export { LotterySystem }
