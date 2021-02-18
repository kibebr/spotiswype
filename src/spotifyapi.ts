import { IO } from 'fp-ts/IO'
import { map, of, chainEitherKW, tryCatch, TaskEither } from 'fp-ts/TaskEither'
import { Task } from 'fp-ts/Task'
import { pipe, flow } from 'fp-ts/function'
import { User } from './index'
import { getProfile } from './services/SpotifyAPI'
import { getHashParams } from './utils'
import { type, Errors, string } from 'io-ts'

const profileSpotifyResponse = type({
  name: string
})

export const getUserData = (ate: string): TaskEither<string | Errors, User> => pipe(
  tryCatch(
    () => getProfile(ate),
    () => 'Could not fetch user.'
  ),
  chainEitherKW(profileSpotifyResponse.decode),
  map(({ name }) => ({ name, savedSongs: [] }))
)
