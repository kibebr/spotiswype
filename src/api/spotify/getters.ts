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
  getSeveralArtists,
  getRecommendedSongs,
  getFeaturedPlaylists
} from '../../services/SpotifyAPI'
import {
  GetPlaylistsResponseV,
  GetPlaylistTracksResponseV,
  GetProfileResponseV,
  GetRecommendationsResponseV,
  GetSavedTracksResponseV,
  GetSeveralArtistsResponseV,
  GetFeaturedPlaylistsResponseV
} from './types'
import { uncurry2, uncurry4 } from 'fp-ts-std/Function'

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

export const tryGetRecommendedSongs = flow(
  tryCatchK(
    uncurry4(getRecommendedSongs),
    toError
  ),
  chainEitherKW(GetRecommendationsResponseV.decode)
)

export const tryGetFeaturedPlaylists = flow(
  tryCatchK(
    getFeaturedPlaylists,
    toError
  ),
  chainEitherKW(GetFeaturedPlaylistsResponseV.decode)
)
