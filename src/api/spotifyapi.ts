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
import { map as amap, chain as achain, takeLeft, sequence, rights, comprehension, zipWith } from 'fp-ts/lib/Array'
import { pipe, flow } from 'fp-ts/lib/function'
import { left, right, Either } from 'fp-ts/lib/Either'
import { Song, User, Playlist } from '../index'
import { fromThunk, tryGetDecode } from '../utils/FP'
import {
  getProfile,
  getPlaylists,
  getPlaylistTracks,
  getSavedTracks,
  getSeveralArtists,
  getRecommendedSongs
} from '../services/SpotifyAPI'
import { type, string, array, TypeOf, union, null as _null, Errors } from 'io-ts'
import { prop } from 'fp-ts-ramda'
import { merge } from 'fp-ts-std/Record'

const SpotifyArtistV = type({
  name: string,
  id: string
})

const SpotifyAlbumV = type({
  images: array(type({
    url: string
  }))
})

const SpotifyItemV = type({
  track: type({
    artists: array(SpotifyArtistV),
    id: string
  })
})

const SpotifyTrackV = type({
  album: SpotifyAlbumV,
  artists: array(SpotifyArtistV),
  id: string,
  name: string,
  preview_url: union([_null, string])
})

const SpotifyPlaylistV = type({
  id: string,
  name: string
})

const GetPlaylistTracksResponseV = type({
  items: array(type({
    track: SpotifyTrackV
  }))
})

const GetPlaylistsResponseV = type({
  items: array(SpotifyPlaylistV)
})

const GetProfileResponseV = type({
  display_name: string,
  id: string
})

const GetSeveralArtistsResponseV = type({
  artists: array(type({
    genres: array(string)
  }))
})

const GetSavedTracksResponseV = type({
  items: array(SpotifyItemV)
})

const GetRecommendationsResponseV = type({
  tracks: array(SpotifyTrackV)
})

type GetPlaylistTracksResponse = TypeOf<typeof GetPlaylistTracksResponseV>
type GetPlaylistsResponse = TypeOf<typeof GetPlaylistsResponseV>
type GetProfileResponse = TypeOf<typeof GetProfileResponseV>
type SpotifyTrack = TypeOf<typeof SpotifyTrackV>
type SpotifyItem = TypeOf<typeof SpotifyItemV>
type SpotifyArtist = TypeOf<typeof SpotifyArtistV>
type SpotifyAlbum = TypeOf<typeof SpotifyAlbumV>
type SpotifyPlaylist = TypeOf<typeof SpotifyPlaylistV>
type SavedTracksResponse = TypeOf<typeof GetSavedTracksResponseV>
type SeveralArtistsResponse = TypeOf<typeof GetSeveralArtistsResponseV>
type RecommendationsResponse = TypeOf<typeof GetRecommendationsResponseV>
type SpotifyPlaylistWithTracks = SpotifyPlaylist & { tracks: SpotifyTrack[] }

const get5Items: (t: SavedTracksResponse) => SpotifyItem[] = flow(prop('items'), takeLeft(2))

const get5Artists: (savedTracks: SavedTracksResponse) => SpotifyArtist[] = flow(get5Items, amap(item => item.track.artists[0]))

const tryGetPlaylists = (token: string): TaskEither<Error | Errors, GetPlaylistsResponse> =>
  tryGetDecode([async () => await getPlaylists(token), GetPlaylistsResponseV])

const tryGetPlaylistTracks = (playlistId: string) => (token: string): TaskEither<Error | Errors, GetPlaylistTracksResponse> =>
  tryGetDecode([async () => await getPlaylistTracks(playlistId)(token), GetPlaylistTracksResponseV])

const tryGetProfile = (token: string): TaskEither<Error | Errors, GetProfileResponse> =>
  tryGetDecode([async () => await getProfile(token), GetProfileResponseV])

const tryGetSavedTracks = (token: string): TaskEither<Error | Errors, SavedTracksResponse> =>
  tryGetDecode([async () => await getSavedTracks(token), GetSavedTracksResponseV])

const tryGetSeveralArtists = (ids: string[]) => (token: string): TaskEither<Error | Errors, SeveralArtistsResponse> =>
  tryGetDecode([async () => await getSeveralArtists(ids)(token), GetSeveralArtistsResponseV])

const getImageFromAlbum: (a: SpotifyAlbum) => string = flow(prop('images'), images => images[1].url)

const trackToSong = ({ name, artists, album, preview_url }: SpotifyTrack): Either<string, Song> =>
  preview_url === null
    ? left("This track can't be converted to a Song.")
    : right(({
      name,
      author: artists[0].name,
      audio: new Audio(preview_url),
      imageUrl: getImageFromAlbum(album)
    }))

export const getRecommendations = (token: string): TaskEither<Error | Errors, RecommendationsResponse> => pipe(
  Do,
  bind('savedTracks', () => tryGetSavedTracks(token)),
  chainW(({ savedTracks }) => pipe(
    of(getRecommendedSongs),
    ap(of(pipe(
      get5Items(savedTracks),
      amap(flow(prop('track'), prop('id')))
    ))),
    ap(of(pipe(
      get5Artists(savedTracks),
      amap(prop('id'))
    ))),
    apW(pipe(
      get5Artists(savedTracks),
      amap(prop('id')),
      (ids) => tryGetSeveralArtists(ids)(token),
      temap(flow(
        prop('artists'),
        amap(a => a.genres[0])
      ))
    )),
    ap(of<any, string>(token)),
    chain(promise => fromThunk(async () => await promise))
  )),
  chainEitherKW(GetRecommendationsResponseV.decode)
)

export const getSongs: (token: string) => TaskEither<Error | Errors, Song[]> = flow(
  getRecommendations,
  temap(flow(
    prop('tracks'),
    amap(trackToSong),
    rights
  ))
)

const createDomainPlaylist = ({ id, name, tracks }: SpotifyPlaylistWithTracks): Playlist => ({
  id,
  name,
  songs: pipe(tracks.map(trackToSong), rights)
})

const createUserFromAPI = ({ id, display_name }: GetProfileResponse) => (spts: SpotifyPlaylistWithTracks[]): any => ({
  id,
  name: display_name,
  playlists: spts.map(createDomainPlaylist)
})

const mergeSpotifyPlaylistAndTracks = (sp: SpotifyPlaylist, trs: SpotifyTrack[]): SpotifyPlaylistWithTracks => ({
  ...sp,
  tracks: trs
})

// const SpotifyPlaylistToPlaylist = (sp: GetPlaylistsResponse)

export const log = <A>(a: A) => {
  console.log(a)
  return a
}

const getUserPlaylistsWithTracks = (token: string): TaskEither<Error | Errors, SpotifyPlaylistWithTracks[]> => pipe(
  tryGetPlaylists(token),
  chain(({ items }) => pipe(
    items.map(({ id }) => tryGetPlaylistTracks(id)(token)),
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

// get profile, get profile id
// get playlists
// get
// export const getUser = (token: string): TaskEither<Error | Errors, User> => pipe(
//   Do,
//   bind('profile', () => tryGetProfile(token)),
//   bind('playlists', ({ profile }) => tryGetPlaylists(profile.id)(token)),
//   temap(({ profile, playlists }) => ({
//     id: profile.id,
//     name: profile.display_name,
//     playlists: playlists.items
//   }))
// )
