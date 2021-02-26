import {
  chainEitherKW,
  tryCatchK
} from 'fp-ts/lib/TaskEither'
import { flow } from 'fp-ts/lib/function'
import { toError } from 'fp-ts/lib/Either'
import {
  getProfile,
  getPlaylists,
  getPlaylistTracks,
  getSavedTracks,
  getSeveralArtists
} from '../../services/SpotifyAPI'
import {
  GetPlaylistsResponseV,
  GetPlaylistTracksResponseV,
  GetProfileResponseV,
  GetSavedTracksResponseV,
  GetSeveralArtistsResponseV
} from './types'
import { uncurry2 } from 'fp-ts-std/Function'

export const tryGetPlaylists = flow(
  tryCatchK(
    getPlaylists,
    toError
  ),
  chainEitherKW(GetPlaylistsResponseV.decode)
)

export const tryGetPlaylistTracks = flow(
  tryCatchK(
    uncurry2(getPlaylistTracks),
    toError
  ),
  chainEitherKW(GetPlaylistTracksResponseV.decode)
)

export const tryGetProfile = flow(
  tryCatchK(
    getProfile,
    toError
  ),
  chainEitherKW(GetProfileResponseV.decode)
)

export const tryGetSavedTracks = flow(
  tryCatchK(
    getSavedTracks,
    toError
  ),
  chainEitherKW(GetSavedTracksResponseV.decode)
)

export const tryGetSeveralArtists = flow(
  tryCatchK(
    uncurry2(getSeveralArtists),
    toError
  ),
  chainEitherKW(GetSeveralArtistsResponseV.decode)
)
