import {
  map as temap,
  ap,
  chain,
  taskEither,
  TaskEither
} from 'fp-ts/lib/TaskEither'
import { map as amap, sequence, rights, zipWith, findFirstMap } from 'fp-ts/lib/Array'
import { fromNullable, Option } from 'fp-ts/lib/Option'
import { pipe, flow } from 'fp-ts/lib/function'
import { Song } from '../../domain/Song'
import { User } from '../../domain/User'
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
import {
  trackToSong,
  createUserFromAPI
} from './mappers'
import { Errors } from 'io-ts'
import { curry2T } from 'fp-ts-std/Function'
import { prop } from 'fp-ts-ramda'
import { unsafeHead, randomElements } from '../../utils/array'

const curriedTryGetPlaylistTracks = curry2T(tryGetPlaylistTracks)

export const getImageFromAlbum: (a: SpotifyAlbum) => string = flow(
  prop('images'),
  (images) => images[1].url
)

export const getImageFromSpotifyPlaylist: (p: SpotifyPlaylist) => Option<string> = flow(
  prop('images'),
  findFirstMap(flow(prop('url'), fromNullable))
)

export const getArtistFromSong = (song: Song): Author => song.author

export const getRecommendedFromPlaylist = (playlist: Playlist) => ({ token }: User): TaskEither<Error | Errors, Song[]> => pipe(
  playlist,
  prop('songs'),
  randomElements(5),
  amap(flow(
    getArtistFromSong,
    prop('id')
  )),
  (ids) => tryGetRecommendedSongs([[], ids, [], token]),
  temap(prop('tracks')),
  temap(flow(
    amap(trackToSong),
    rights
  ))
)

const mergeSpotifyPlaylistAndTracks = (sp: SpotifyPlaylist, trs: SpotifyTrack[]): SpotifyPlaylistWithTracks => ({
  ...sp,
  tracks: trs
})

const getUserPlaylistsWithTracks = (token: string): TaskEither<Error | Errors, SpotifyPlaylistWithTracks[]> => pipe(
  tryGetPlaylists(token),
  chain(({ items }) => pipe(
    items.map(({ id }) => curriedTryGetPlaylistTracks(id)(token)),
    sequence(taskEither),
    temap(amap(flow(prop('items'), amap(prop('track'))))),
    temap(tracks => zipWith(items, tracks, mergeSpotifyPlaylistAndTracks))
  ))
)

export const getUser = (token: string): TaskEither<Error | Errors, User> => pipe(
  tryGetProfile(token),
  temap(createUserFromAPI(token)),
  ap(getUserPlaylistsWithTracks(token))
)

const getRandomArtists: (tracks: SpotifyTrack[]) => SpotifyArtist[] = flow(
  amap(flow(prop('artists'), unsafeHead)),
  randomElements(5)
)

export const getRecommendedFromLikedSongs = ({ token }: User): TaskEither<Error | Errors, Song[]> => pipe(
  token,
  tryGetSavedTracks,
  temap(prop('items')),
  temap(amap(prop('track'))),
  temap(flow(getRandomArtists, amap(prop('id')))),
  chain((artists) => tryGetRecommendedSongs([[], artists, [], token])),
  temap(prop('tracks')),
  temap(flow(amap(trackToSong), rights))
)
