import * as Joi from 'joi'

const validator = (schema: Joi.ObjectSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validateAsync(req.body, { abortEarly: false })
      next()
    } catch (error) {
      res.status(400).json({
        errors: error.details.map((error: Joi.ValidationErrorItem) => {
          return {
            code: error.type,
            message: error.message,
            field: error.path.join('.')
          }
        })
      })
    }
  }
}

export default validator
