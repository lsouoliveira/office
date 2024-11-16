import CreateUserRequest from './create_user_request'
import { Result, Errors } from '../../../utils.ts'
import { db } from '../../../db'
import { usersTable } from '../../../db/schema'
import * as crypto from 'node:crypto'
import { eq } from 'drizzle-orm'

const createUserService = async (request: CreateUserRequest): Promise<Result<void>> => {
  try {
    const userFound = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, request.email))
      .execute()

    if (userFound.length) {
      return Result.fail(Errors.User.emailAlreadyExists())
    }

    const salt = crypto.randomBytes(16).toString('hex')
    const passwordHash = crypto
      .pbkdf2Sync(request.password, salt, 1000, 64, 'sha512')
      .toString('hex')

    const user = {
      name: request.name,
      email: request.email,
      password_hash: `${passwordHash}.${salt}`
    }

    await db.insert(usersTable).values(user).execute()

    return Result.ok<void>()
  } catch (error) {
    return Result.fail(Errors.General.internalServerError())
  }
}

export default createUserService
