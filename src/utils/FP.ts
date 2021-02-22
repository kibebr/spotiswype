import { chainEitherKW, tryCatch, TaskEither } from 'fp-ts/lib/TaskEither'
import { pipe, Lazy } from 'fp-ts/lib/function'
import { toError } from 'fp-ts/lib/Either'
import { Decoder } from 'io-ts'

const fromThunk = <A>(thunk: Lazy<Promise<A>>): TaskEither<Error, A> => tryCatch(thunk, toError)

export const tryGetDecode = ([fn, decoder]: [Lazy<Promise<unknown>>, Decoder<any, any>]) => pipe(
  fromThunk(fn),
  chainEitherKW(decoder.decode)
)
