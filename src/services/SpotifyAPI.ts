/* eslint-disable @typescript-eslint/promise-function-async */
import { toError } from 'fp-ts/Either'
import { tryCatch } from 'fp-ts/TaskEither'
import { ReaderTaskEither } from 'fp-ts/ReaderTaskEither'

type SpotifyAccessToken = string

type HttpRequestType
  = 'GET'
  | 'POST'

interface Settings {
  type: HttpRequestType
  params: string
}

const newSpotifyRequest = ({ type, params }: Settings): ReaderTaskEither<SpotifyAccessToken, Error, unknown> => (accessToken) => tryCatch(
  () => fetch(`https://api.spotify.com/v1/${params}`, {
    method: type,
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  }).then((res) => res.json()),
  toError
)

export const getProfile = newSpotifyRequest({
  type: 'GET',
  params: 'me'
})

export const getSavedTracks = newSpotifyRequest({
  type: 'GET',
  params: 'me/tracks'
})

export const getSeveralArtists = (artistsIds: readonly string[]) => newSpotifyRequest({
  type: 'GET',
  params: `artists?ids=${artistsIds.join()}`
})

export const getRecommendedSongs =
  (seedTracks: readonly string[]) =>
    (seedArtists: readonly string[]) =>
      (seedGenres: readonly string[]) =>
        newSpotifyRequest({
          type: 'GET',
          params: `recommendations?seed_tracks=${seedTracks.join()}&seed_artists=${seedArtists.join()}&seedGenres=${seedGenres.join().replace(' ', '+')}`
        })

export const getPlaylists = newSpotifyRequest({
  type: 'GET',
  params: 'me/playlists'
})

export const getPlaylistTracks = (playlistId: string) => newSpotifyRequest({
  type: 'GET',
  params: `playlists/${playlistId}/tracks?market=ES`
})

export const getFeaturedPlaylists = newSpotifyRequest({
  type: 'GET',
  params: 'browse/featured-playlists'
})
