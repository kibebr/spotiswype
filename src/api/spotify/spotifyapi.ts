import {
  map as temap,
  of,
  ap,
  chain,
  chainEitherKW,
  chainW,
  apW,
  Do,
  bind,
  taskEither,
  TaskEither
} from 'fp-ts/lib/TaskEither'
import { map as amap, takeLeft, sequence, rights, zipWith, findFirstMap } from 'fp-ts/lib/Array'
import { fromNullable, Option } from 'fp-ts/lib/Option'
import { pipe, flow } from 'fp-ts/lib/function'
import { Playlist, Song, User, Author } from '../../index'
import {
  tryGetSavedTracks,
  tryGetSeveralArtists,
  tryGetPlaylists,
  tryGetProfile,
  tryGetPlaylistTracks,
  tryGetRecommendedSongs
} from './getters'
import {
  GetRecommendationsResponseV,
  SavedTracksResponse,
  RecommendationsResponse,
  SpotifyArtist,
  SpotifyAlbum,
  SpotifyItem,
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

export const get5Items: (t: SavedTracksResponse) => SpotifyItem[] = flow(prop('items'), takeLeft(2))

export const get5Artists: (savedTracks: SavedTracksResponse) => SpotifyArtist[] = flow(get5Items, amap(item => item.track.artists[0]))

export const getImageFromAlbum: (a: SpotifyAlbum) => string = flow(prop('images'), images => images[1].url)

export const getImageFromSpotifyPlaylist: (p: SpotifyPlaylist) => Option<string> = flow(
  prop('images'),
  findFirstMap(({ url }) => fromNullable(url))
)

export const getArtistFromSong = (song: Song): Author => song.author

export const getRecommendedFromPlaylist = (playlist: Playlist) => (token: string): TaskEither<Error | Errors, Song[]> => pipe(
  playlist,
  prop('songs'),
  takeLeft(3),
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

// export const getSongs: (token: string) => TaskEither<Error | Errors, Song[]> = flow(
//   getRecommendations,
//   temap(flow(
//     prop('tracks'),
//     amap(trackToSong),
//     rights
//   ))
// )

const mergeSpotifyPlaylistAndTracks = (sp: SpotifyPlaylist, trs: SpotifyTrack[]): SpotifyPlaylistWithTracks => ({
  ...sp,
  tracks: trs
})

const curried = curry2T(tryGetPlaylistTracks)

const getUserPlaylistsWithTracks = (token: string): TaskEither<Error | Errors, SpotifyPlaylistWithTracks[]> => pipe(
  tryGetPlaylists(token),
  temap((items) => { console.log(items); return items }),
  chain(({ items }) => pipe(
    items.map(({ id }) => curried(id)(token)),
    sequence(taskEither),
    temap(amap(prop('items'))),
    temap(amap(amap(prop('track')))),
    temap(tracks => zipWith(items, tracks, mergeSpotifyPlaylistAndTracks))
  ))
)

export const getUser = (token: string): TaskEither<Error | Errors, User> => pipe(
  tryGetProfile(token),
  temap(createUserFromAPI),
  ap(getUserPlaylistsWithTracks(token))
)

// export const getRecommendations = (token: string): TaskEither<Error | Errors, RecommendationsResponse> => pipe(
//   Do,
//   bind('savedTracks', () => tryGetSavedTracks(token)),
//   chainW(({ savedTracks }) => pipe(
//     of(getRecommendedSongs),
//     ap(of(pipe(
//       get5Items(savedTracks),
//       amap(flow(prop('track'), prop('id')))
//     ))),
//     ap(of(pipe(
//       get5Artists(savedTracks),
//       amap(prop('id'))
//     ))),
//     apW(pipe(
//       get5Artists(savedTracks),
//       amap(prop('id')),
//       (ids) => tryGetSeveralArtists(ids)(token),
//       temap(flow(
//         prop('artists'),
//         amap(a => a.genres[0])
//       ))
//     )),
//     ap(of<any, string>(token)),
//     chain(promise => fromThunk(async () => await promise))
//   )),
//   chainEitherKW(GetRecommendationsResponseV.decode)
// )
