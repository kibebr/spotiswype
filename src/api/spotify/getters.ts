import { chainEitherKW } from 'fp-ts/ReaderTaskEither'
import { pipe, flow } from 'fp-ts/function'
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
import { uncurry4 } from 'fp-ts-std/Function'

export const tryGetPlaylists = pipe(
  getPlaylists,
  chainEitherKW(GetPlaylistsResponseV.decode)
)

export const tryGetPlaylistTracks = flow(
  getPlaylistTracks,
  chainEitherKW(GetPlaylistTracksResponseV.decode)
)

export const tryGetProfile = pipe(
  getProfile,
  chainEitherKW(GetProfileResponseV.decode)
)

export const tryGetSavedTracks = pipe(
  getSavedTracks,
  chainEitherKW(GetSavedTracksResponseV.decode)
)

export const tryGetSeveralArtists = flow(
  getSeveralArtists,
  chainEitherKW(GetSeveralArtistsResponseV.decode)
)

export const tryGetRecommendedSongs = pipe(
  getRecommendedSongs,
  uncurry4,
  chainEitherKW(GetRecommendationsResponseV.decode)
)

export const tryGetFeaturedPlaylists = pipe(
  getFeaturedPlaylists,
  chainEitherKW(GetFeaturedPlaylistsResponseV.decode)
)
