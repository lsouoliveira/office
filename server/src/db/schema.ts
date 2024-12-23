import { sql, relations } from 'drizzle-orm'
import { int, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const usersTable = sqliteTable('users_table', {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  email: text().notNull().unique(),
  password_hash: text().notNull()
})

export const lotteryResultsTable = sqliteTable('lottery_results_table', {
  id: int().primaryKey({ autoIncrement: true }),
  prize: real().notNull(),
  number: int().notNull(),
  created_at: text().default(sql`(CURRENT_TIMESTAMP)`)
})

export const lotteryResultWinnersTable = sqliteTable('lottery_result_winners_table', {
  id: int().primaryKey({ autoIncrement: true }),
  player_id: text().notNull(),
  player_name: text().notNull(),
  lottery_result_id: int()
    .references(() => lotteryResultsTable.id)
    .notNull(),
  prize: real().notNull(),
  created_at: text().default(sql`(CURRENT_TIMESTAMP)`)
})

export const lotteryResultRelations = relations(lotteryResultsTable, ({ many }) => ({
  winners: many(lotteryResultWinnersTable)
}))

export const lotteryResultWinnersRelations = relations(lotteryResultWinnersTable, ({ one }) => ({
  lotteryResult: one(lotteryResultsTable, {
    fields: [lotteryResultWinnersTable.lottery_result_id],
    references: [lotteryResultsTable.id]
  })
}))

export const housesTable = sqliteTable('houses_table', {
  id: int().primaryKey({ autoIncrement: true }),
  price: real().notNull(),
  ownerId: text()
})
