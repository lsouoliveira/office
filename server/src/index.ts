import express from 'express'
import { Server } from 'socket.io'
import cors from 'cors'
import { World } from './world'
import sessionRoutes from './routes/session_routes'
import userRoutes from './routes/user_routes'

const app = express()

app.use(cors())
app.use(express.json())

app.use(express.static('../client/dist'))

app.use('/api/users', sessionRoutes)
app.use('/api/users', userRoutes)

const httpServer = app.listen(3000, () => {
  console.log('Listening at port 3000')
})

const io = new Server(httpServer, { cors: { origin: '*' } })
const world = new World(io)

world.start()
