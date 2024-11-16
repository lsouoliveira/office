import express from 'express'

import validator from '../middlewares/validator'
import authorized from '../middlewares/authorized'

import createUserController from '../controllers/users/create_user/create_user_controller'
import createUserSchema from '../controllers/users/create_user/create_user_schema'

import showUserController from '../controllers/users/show_user/show_user_controller'

const router = express.Router()

router.post('/sign_up', validator(createUserSchema), createUserController)
router.get('/:id', authorized, showUserController)

export default router
