import * as RA from 'fp-ts/ReadonlyArray'
import * as RTE from 'fp-ts/ReaderTaskEither'
import * as TE from 'fp-ts/TaskEither'
import { fromNullable, Option } from 'fp-ts/Option'
import { pipe, flow } from 'fp-ts/function'
import { Song } from '../../domain/Song'
import { Author } from '../../domain/Author'
import { Playlist } from '../../domain/Playlist'
import {
  tryGetSavedTracks,
  tryGetPlaylists,
  tryGetProfile,
  tryGetPlaylistTracks,
  tryGetRecommendedSongs
} from './getters'
import {
  SpotifyArtist,
  SpotifyAlbum,
  SpotifyTrack,
  SpotifyPlaylist,
  SpotifyPlaylistWithTracks
} from './types'
import { spotifyTracksToSongs, createUserFromAPI, trackToSong } from './mappers'
import { Errors } from 'io-ts'
import { prop } from 'fp-ts-ramda'
import { unsafeHead, randomElements } from '../../utils/array'
import { curry4T } from 'fp-ts-std/Function'

const curried = curry4T(tryGetRecommendedSongs)

export const getImageFromAlbum: (a: SpotifyAlbum) => string = flow(prop('images'), (images) => images[1].url)

export const getImageFromSpotifyPlaylist: (p: SpotifyPlaylist) => Option<string> = flow(
  prop('images'),
  RA.findFirstMap(flow(prop('url'), fromNullable))
)

export const getArtistFromSong = (song: Song): Author => song.author

export const getRecommendedFromPlaylist = (playlist: Playlist): RTE.ReaderTaskEither<string, string | Error | Errors, readonly Song[]> => (token) => pipe(
  playlist,
  prop('songs'),
  randomElements(5),
  RA.map(flow(getArtistFromSong, prop('id'))),
  (ids) => curried([])(ids)([])(token),
  TE.chainEitherKW(flow(prop('tracks'), spotifyTracksToSongs))
)

const mergeSpotifyPlaylistAndTracks = (sp: SpotifyPlaylist, trs: readonly SpotifyTrack[]): SpotifyPlaylistWithTracks => ({
  ...sp,
  tracks: trs
})

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

const getRandomArtists: (tracks: readonly SpotifyTrack[]) => readonly SpotifyArtist[] = flow(
  RA.map(flow(prop('artists'), unsafeHead)),
  randomElements(5)
)

export const getRecommendedFromLikedSongs: RTE.ReaderTaskEither<string, string | Error | Errors, readonly Song[]> = pipe(
  tryGetSavedTracks,
  RTE.map(flow(
    prop('items'),
    RA.map(prop('track')),
    flow(getRandomArtists, RA.map(prop('id')))
  )),
  RTE.chain((artists) => curried([])(artists)([])),
  RTE.map(flow(prop('tracks'), RA.map(trackToSong), RA.rights))
)
