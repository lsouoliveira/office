import { CustomError, ApiErrorResponse, Errors } from '../../../utils'
import { Request, Response } from 'express'

const showUserController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    res.send()
  } catch (error) {
    const customError = ApiErrorResponse.fromError(Errors.General.internalServerError())

    res.status(500).send(customError)
  }
}

export default showUserController
