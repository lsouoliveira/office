import createSession from '../../../services/sessions/create_session/create_session'
import createSessionRequest from '../../../services/sessions/create_session/create_session_request'

import { Request, Response } from 'express'
import { ApiErrorResponse, Errors } from '../../../utils'

const createSessionController = async (req: Request, res: Response) => {
  const { email, password } = req.body
  const payload = {
    email,
    password
  } as createSessionRequest

  try {
    const result = await createSession(payload)

    if (result.isFail()) {
      const error = result.getError()

      return res.status(400).json(ApiErrorResponse.fromError(error))
    }

    const response = result.getValue()

    res.status(200).json(response)
  } catch (error) {
    const customError = ApiErrorResponse.fromError(Errors.General.internalServerError())

    res.status(500).json(customError)
  }
}

export default createSessionController
