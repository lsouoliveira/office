import * as Joi from 'joi'

const createUserSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .required()
    .custom((value, helpers) => {
      if (value.length < 6) {
        return helpers.error('user.password.too_short')
      }

      return value
    }),
  password_confirmation: Joi.string().custom((value, helpers) => {
    if (value !== helpers.state.ancestors[0].password) {
      return helpers.error('user.password_confirmation.must_match')
    }

    return value
  })
})

export default createUserSchema
