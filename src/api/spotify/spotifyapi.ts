import * as RA from 'fp-ts/ReadonlyArray'
import * as RTE from 'fp-ts/ReaderTaskEither'
import * as TE from 'fp-ts/TaskEither'
import { pipe, flow } from 'fp-ts/function'
import { Seeds } from '../../domain/Seeds'
import { Song, getArtistFromSong } from '../../domain/Song'
import { Playlist, getSongsFromPlaylist } from '../../domain/Playlist'
import { mergeSpotifyPlaylistAndTracks, getRandomArtistsFromTrack, seedsToSpotifySeeds } from './utils'
import {
  tryGetSavedTracks,
  tryGetPlaylists,
  tryGetProfile,
  tryGetPlaylistTracks,
  tryGetRecommendedSongs
} from './getters'
import {
  SpotifyPlaylistWithTracks
} from './types'
import { createUserFromAPI, trackToSong } from './mappers'
import { Errors } from 'io-ts'
import { prop } from 'fp-ts-ramda'
import { randomElements } from '../../utils/array'
import { curry4T } from 'fp-ts-std/Function'

const curried = curry4T(tryGetRecommendedSongs)

export const getRecommendedFromPlaylist = (playlist: Playlist): RTE.ReaderTaskEither<string, string | Error | Errors, readonly Song[]> => (token) => pipe(
  playlist,
  prop('songs'),
  randomElements(5),
  RA.map(flow(getArtistFromSong, prop('id'))),
  (ids) => curried([])(ids)([])(token),
  TE.map(flow(prop('tracks'), RA.map(trackToSong), RA.rights))
)

export const getUserPlaylistsWithTracks: RTE.ReaderTaskEither<string, Error | Errors, readonly SpotifyPlaylistWithTracks[]> = pipe(
  tryGetPlaylists,
  RTE.chain(({ items }) => pipe(
    items,
    RTE.traverseArray(flow(prop('id'), tryGetPlaylistTracks)),
    RTE.map(flow(
      RA.map(flow(prop('items'), RA.map(prop('track')))),
      (tracks) => RA.zipWith(items, tracks, mergeSpotifyPlaylistAndTracks)
    ))
  ))
)

export const getUser = pipe(
  tryGetProfile,
  RTE.map(createUserFromAPI),
  RTE.ap(getUserPlaylistsWithTracks),
  RTE.chainW(RTE.rightReader)
)

export const getRecommendedFromLikedSongs: RTE.ReaderTaskEither<string, string | Error | Errors, readonly Song[]> = pipe(
  tryGetSavedTracks,
  RTE.map(flow(
    prop('items'),
    RA.map(prop('track')),
    flow(getRandomArtistsFromTrack, RA.map(prop('id')))
  )),
  RTE.chain((artists) => curried([])(artists)([])),
  RTE.map(flow(prop('tracks'), RA.map(trackToSong), RA.rights))
)

export const getRecommendedFromSeeds: (seeds: Seeds) => RTE.ReaderTaskEither<string, string | Error | Errors, readonly Song[]> = flow(
  seedsToSpotifySeeds,
  ({ artistsIds, tracksIds, genres }) => curried(tracksIds)(artistsIds)(genres),
  RTE.map(flow(prop('tracks'), RA.map(trackToSong), RA.rights))
)
