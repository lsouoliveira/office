class CustomError {
  public readonly code: string
  public readonly message: string
  public readonly field?: string

  constructor(code: string, message: string, field?: string) {
    this.code = code
    this.message = message
    this.field = field
  }

  equals(error: CustomError): boolean {
    return this.code == error.code
  }
}

namespace Errors {
  export class General {
    static internalServerError() {
      return new CustomError('general.internal_server_error', 'Internal server error')
    }

    static badRequest() {
      return new CustomError('general.bad_request', 'Bad request')
    }
  }

  export class User {
    static emailAlreadyExists() {
      return new CustomError('user.email_already_exists', 'Email already exists', 'email')
    }
  }
}

class Result<T> {
  private value?: T
  private error?: CustomError

  constructor(value?: T, error?: CustomError) {
    this.value = value
    this.error = error

    if (this.value && this.error) {
      throw Error('Result cannot have both value and error')
    }
  }

  getValue() {
    return this.value
  }

  getError(): CustomError {
    if (!this.error) {
      throw new Error('Result has no error')
    }

    return this.error
  }

  isOk(): boolean {
    return this.value !== undefined
  }

  isFail(): boolean {
    return this.error !== undefined
  }

  static ok<T>(value?: T): Result<T> {
    return new Result<T>(value)
  }

  static fail<T>(error: CustomError): Result<T> {
    return new Result<T>(undefined, error)
  }
}

class ApiErrorResponse {
  public readonly errors: CustomError[]

  constructor(errors: CustomError[]) {
    this.errors = errors
  }

  static fromError(error: CustomError): ApiErrorResponse {
    return new ApiErrorResponse([error])
  }
}

export { Result, CustomError, ApiErrorResponse, Errors }
