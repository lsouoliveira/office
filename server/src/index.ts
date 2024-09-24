import express from 'express'
import { Server } from 'socket.io'
import cors from 'cors'
import { World } from './world'

const app = express()

app.use(cors())

app.use((req, res, next) => {
  if (req.query.token === '123') {
    return next()
  }

  res.status(401).send('Unauthorized')
})

app.use(express.static('../client/public'))

const httpServer = app.listen(3000, () => {
  console.log('Listening at port 3000')
})

const io = new Server(httpServer, { cors: { origin: '*' } })
const world = new World(io)

world.start()
