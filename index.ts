/*
  Usage:

  const [value, error] = untry(() => {
    // some code
  })

  // defer runs always regardless an error was thrown or not
  const [value, error] = untry((defer) => {
    defer((err) => {
      // clean resources
    })
    // some code
  })

*/

const errorToken = '@untry/error'

type ThenArg<T> = T extends PromiseLike<infer U> ? U : T

export type ValueOrError<T> = T | Error
export type Catch<T> = [T, Error]
export type Deferred = (error?: Error) => void
export type Defer = (deferred: Deferred) => void

export type CustomError = Error & {
  toJSON?: () => any
  [errorToken]?: boolean
}

const customError = (error: Error, name?: string): CustomError => {
  if (!(error instanceof Error)) {
    throw new Error('Only accept instances of Error')
  }
  const sError: CustomError = error

  sError['toJSON'] = function () {
    return {
      [errorToken]: true,
      name: this.name,
      message: this.message,
    }
  }

  sError[errorToken] = true

  if (name) {
    error.name = name
  }

  return error
}

const isCustomError = (error?: CustomError): boolean => Boolean(error && error[errorToken])
const createResult = <T>(val: ValueOrError<T>): Catch<T> => {
  return (isCustomError(val as Error) ? [void 0, val] : [val, void 0]) as unknown as Catch<T>
}

function untry<F extends (defer?: Defer) => PromiseLike<any>>(fn: F): PromiseLike<Catch<ThenArg<ReturnType<F>>>>;
function untry<F extends (defer?: Defer) => ValueOrError<any>>(fn: F): Catch<ReturnType<F>>;
function untry<F extends (defer?: Defer) => any>(fn: F): Catch<ReturnType<F>>;
function untry(fn: Function): any {
  let deferred: Deferred = () => { }
  const defer = (d: Deferred) => deferred = d
  const execDeferred = (err?: CustomError) => {
    try { deferred(err) } catch { }
  }

  try {
    const result: any = fn(defer)
    if (result && typeof result.then === 'function') {
      return new Promise((resolve) => {
        result.then(
          (res: any) => {
            execDeferred()
            resolve(createResult(res))
          },
          (err: any) => {
            execDeferred(err)
            resolve(createResult(customError(err)))
          }
        )
      })
    }
    execDeferred()
    return createResult(result)
  } catch (err) {
    execDeferred(err as Error)
    return createResult(customError(err as Error))
  }
}

untry.error = (error: Error, name?: string): ValueOrError<any> => customError(error, name)

export default untry
