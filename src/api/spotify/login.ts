import * as IO from 'fp-ts/IO'
import * as TE from 'fp-ts/TaskEither'
import { User } from '../../domain/User'
import { fromString, getParam } from 'fp-ts-std/URLSearchParams'
import { pipe, flow, constant } from 'fp-ts/function'
import { append } from 'fp-ts-std/String'
import { Errors } from 'io-ts'
import { getUser } from './spotifyapi'

const scopes = 'user-read-private, user-library-read, playlist-read-private, playlist-read-collaborative'

const spotifyCallbackUrl: string = pipe(
  'https://accounts.spotify.com/authorize',
  append('?response_type=token'),
  append(`&client_id=${encodeURIComponent(process.env.REACT_APP_CLIENT_ID as string)}`),
  append(`&scope=${encodeURIComponent(scopes)}`),
  append(`&redirect_uri=${encodeURIComponent(process.env.REACT_APP_REDIRECT_URI as string)}`)
)

const getWindowHash: IO.IO<string> = () => window.location.hash.split('#')[1]

export const handleFetchUser: TE.TaskEither<Error | Errors, User> = pipe(
  getWindowHash,
  IO.map(flow(fromString, getParam('access_token'))),
  TE.fromIO,
  TE.chain(TE.fromOption(pipe('No access token.', Error, constant))),
  TE.chainW(getUser)
)

export const handleLogin: IO.IO<void> = () => { window.location.href = spotifyCallbackUrl }
