import * as JSON from 'fp-ts/Json'
import * as IOE from 'fp-ts/IOEither'
import * as E from 'fp-ts/Either'
import * as F from 'fp-ts/function'
import * as LS from 'fp-ts-local-storage'
import { JsonFromString } from 'io-ts-types'
import { Song, SongVArray } from '../domain/Song'

const SongsFromJson = JsonFromString.pipe(SongVArray)

export const getCachedLikedSongs = F.pipe(
  LS.getItem('likedSongs'),
  IOE.fromIO,
  IOE.chainEitherK(F.flow(
    E.fromOption(F.constant('No values.')),
    E.chainW(SongsFromJson.decode)
  ))
)

export const setCachedLikedSongs: (songs: readonly Song[]) => IOE.IOEither<unknown, void> = F.flow(
  JSON.stringify,
  IOE.fromEither,
  IOE.chainIOK((data) => LS.setItem('likedSongs', data))
)
