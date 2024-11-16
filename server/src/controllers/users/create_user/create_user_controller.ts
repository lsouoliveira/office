import createUserSchema from './create_user_schema.ts'
import createUser from '../../../services/users/create_user/create_user'
import createUserRequest from '../../../services/users/create_user/create_user_request'
import createUserResponse from '../../../services/users/create_user/create_user_response'
import { CustomError, ApiErrorResponse, Errors } from '../../../utils'
import { Request, Response } from 'express'

const createUserController = async (req: Request, res: Response) => {
  const { name, email, password } = req.body
  const payload = {
    name,
    email,
    password
  } as createUserRequest

  try {
    const result = await createUser(payload)

    if (result.isFail()) {
      const error = result.getError()

      return res.status(400).json(ApiErrorResponse.fromError(error))
    }

    res.status(200).send()
  } catch (error) {
    const customError = ApiErrorResponse.fromError(Errors.General.internalServerError())

    res.status(500).send(customError)
  }
}

export default createUserController
