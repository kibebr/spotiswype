import { Either } from 'fp-ts/lib/Either'
import { chainEitherKW, tryCatch, TaskEither } from 'fp-ts/lib/TaskEither'
import { pipe, Lazy } from 'fp-ts/lib/function'
import { toError } from 'fp-ts/lib/Either'
import { Decoder } from 'io-ts'

export const fromThunk = <A>(thunk: Lazy<Promise<A>>): TaskEither<Error, A> => tryCatch(thunk, toError)

export const tryGetDecode = ([fn, decoder]: [Lazy<Promise<unknown>>, Decoder<any, any>]) => pipe(
  fromThunk(fn),
  chainEitherKW(decoder.decode)
)

export const rights = <E, A>(as: Either<E, A>[]): A[] => {
  const r: Array<A> = []
  const len = as.length

  for (let i = 0; i < len; i++) {
    const a = as[i]
    if (a._tag === 'Right') {
      r.push(a.right)
    }
  }

  return r
}
