import jsonwebtoken from 'jsonwebtoken'
import { db } from './../db'
import { usersTable } from './../db/schema'
import { eq } from 'drizzle-orm'

const authorized = async (req, res, next) => {
  const token = req.headers.authorization

  if (!token) {
    return res.status(401).json({ error: 'Token not provided' })
  }

  const [_, accessToken] = token.split(' ')

  try {
    jsonwebtoken.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
    const { id } = jsonwebtoken.decode(accessToken) as { id: number }
    const user = await db.select().from(usersTable).where(eq(usersTable.id, id)).execute()

    if (!user.length) {
      return res.status(401).json({ error: 'accessToken invalid' })
    }

    req.user = user[0]

    next()
  } catch (error) {
    return res.status(401).json({ error: 'accessToken invalid' })
  }
}

export default authorized
