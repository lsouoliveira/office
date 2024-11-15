import express from 'express'

import validator from '../middlewares/validator'

import createSessionController from '../controllers/sessions/create_session/create_session_controller'
import createSessionSchema from '../controllers/sessions/create_session/create_session_schema'

const router = express.Router()

router.post('/sign_in', validator(createSessionSchema), createSessionController)

export default router
