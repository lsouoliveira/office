import CreateSessionRequest from './create_session_request.ts'
import CreateSessionResponse from './create_session_response.ts'

import { Result, Errors } from '../../../utils.ts'
import { db } from '../../../db'
import { usersTable } from '../../../db/schema'
import * as crypto from 'node:crypto'
import { eq } from 'drizzle-orm'
import jsonwebtoken from 'jsonwebtoken'

const createSession = async (
  request: CreateSessionRequest
): Promise<Result<CreateSessionResponse>> => {
  try {
    const userFound = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, request.email))
      .execute()

    if (!userFound.length) {
      return Result.fail(Errors.General.badRequest())
    }

    const [hash, salt] = userFound[0].password_hash.split('.')

    const passwordHash = crypto
      .pbkdf2Sync(request.password, salt, 1000, 64, 'sha512')
      .toString('hex')

    if (crypto.timingSafeEqual(Buffer.from(passwordHash), Buffer.from(hash))) {
      const payload = {
        id: userFound[0].id,
        email: userFound[0].email
      }

      const accessToken = jsonwebtoken.sign(payload, process.env.ACCESS_TOKEN_SECRET)

      return Result.ok<CreateSessionResponse>({
        access_token: accessToken
      })
    } else {
      return Result.fail(Errors.General.badRequest())
    }
  } catch (error) {
    return Result.fail(Errors.General.internalServerError())
  }
}

export default createSession
