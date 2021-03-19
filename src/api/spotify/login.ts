import { chain, fromOption, TaskEither } from 'fp-ts/lib/TaskEither'
import { IO } from 'fp-ts/lib/IO'
import { User } from '../../index'
import { fromString, getParam } from 'fp-ts-std/URLSearchParams'
import { pipe, flow, constant } from 'fp-ts/lib/function'
import { append } from 'fp-ts-std/String'
import { Errors } from 'io-ts'
import { getUser } from './spotifyapi'

// can't destruct both at the same... https://github.com/mrsteele/dotenv-webpack/issues/70
const { REACT_APP_CLIENT_ID } = process.env
const { REACT_APP_REDIRECT_URI } = process.env

const scopes = 'user-read-private, user-library-read, playlist-read-private, playlist-read-collaborative'

const spotifyCallbackUrl: string = pipe(
  'https://accounts.spotify.com/authorize',
  append('?response_type=token'),
  append(`&client_id=${encodeURIComponent(REACT_APP_CLIENT_ID as string)}`),
  append(`&scope=${encodeURIComponent(scopes)}`),
  append(`&redirect_uri=${encodeURIComponent(REACT_APP_REDIRECT_URI as string)}`)
)

const getWindowHash: IO<string> = () => window.location.hash.split('#')[1]

export const handleFetchUser: () => TaskEither<Error | Errors, User> = flow(
  getWindowHash,
  fromString,
  getParam('access_token'),
  fromOption(pipe(
    'No access token.',
    Error,
    constant
  )),
  chain(getUser)
)

export const handleLogin: IO<void> = () => { window.location.href = spotifyCallbackUrl }
