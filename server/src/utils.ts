class CustomError {
  public readonly code: string

  constructor(code) {
    this.code = code
  }

  equals(error: CustomError): boolean {
    return this.code == error.code
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

  isOk(): boolean {
    return this.value !== undefined
  }

  isFail(): boolean {
    return this.error !== undefined
  }

  static ok<T>(value: T): Result<T> {
    return new Result<T>(value)
  }

  static fail<T>(error: CustomError): Result<T> {
    return new Result(undefined, error)
  }
}

export { Result, CustomError }
