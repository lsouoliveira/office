import express from 'express'
import { Server } from 'socket.io'
import cors from 'cors'
import { World } from './world'

const app = express()

app.use(cors())

const httpServer = app.listen(3001, () => {
  console.log('Listening at port 3001')
})

const io = new Server(httpServer, { cors: { origin: '*' } })
const world = new World(io)

world.start()
