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
import { map as amap, filter, takeLeft, sequence } from 'fp-ts/lib/Array'
import { fold } from 'fp-ts/lib/Monoid'
import { pipe, flow, Lazy } from 'fp-ts/lib/function'
import { getValidationMonoid, isRight, left, right, Either } from 'fp-ts/lib/Either'
import { Song, User, Playlist } from '../index'
import { fromThunk, tryGetDecode, rights } from '../utils/FP'
import {
  getProfile,
  getPlaylists,
  getPlaylistTracks,
  getSavedTracks,
  getSeveralArtists,
  getRecommendedSongs
} from '../services/SpotifyAPI'
import { type, string, array, TypeOf, union, null as _null, intersection, Errors } from 'io-ts'
import { prop } from 'fp-ts-ramda'

const ArtistV = type({
  name: string,
  id: string
})

const AlbumV = type({
  images: array(type({
    url: string
  }))
})

const ItemV = type({
  track: type({
    artists: array(ArtistV),
    id: string
  })
})

const TrackV = type({
  album: AlbumV,
  artists: array(ArtistV),
  id: string,
  name: string,
  preview_url: union([_null, string])
})

const PlaylistV = type({
  id: string,
  name: string
})

const GetPlaylistTracksResponseV = type({
  items: array(TrackV)
})

const GetPlaylistsResponseV = type({
  items: array(PlaylistV)
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
  items: array(ItemV)
})

const GetRecommendationsResponseV = type({
  tracks: array(TrackV)
})

type GetPlaylistTracksResponse = TypeOf<typeof GetPlaylistTracksResponseV>
type GetPlaylistsResponse = TypeOf<typeof GetPlaylistsResponseV>
type GetProfileResponse = TypeOf<typeof GetProfileResponseV>
type Track = TypeOf<typeof TrackV>
type Item = TypeOf<typeof ItemV>
type Artist = TypeOf<typeof ArtistV>
type Album = TypeOf<typeof AlbumV>
type SpotifyPlaylist = TypeOf<typeof PlaylistV>
type SavedTracksResponse = TypeOf<typeof GetSavedTracksResponseV>
type SeveralArtistsResponse = TypeOf<typeof GetSeveralArtistsResponseV>
type RecommendationsResponse = TypeOf<typeof GetRecommendationsResponseV>
type SpotifyPlaylistWithTracks = SpotifyPlaylist & GetPlaylistTracksResponse

const get5Items: (t: SavedTracksResponse) => Item[] = flow(prop('items'), takeLeft(2))

const get5Artists: (savedTracks: SavedTracksResponse) => Artist[] = flow(get5Items, amap(item => item.track.artists[0]))

const tryGetPlaylists = (token: string): TaskEither<Error | Errors, GetPlaylistsResponse> =>
  tryGetDecode([() => getPlaylists(token), GetPlaylistsResponseV])

const tryGetPlaylistTracks = (playlistId: string) => (token: string): TaskEither<Error | Errors, GetPlaylistTracksResponse> =>
  tryGetDecode([() => getPlaylistTracks(playlistId)(token), GetPlaylistTracksResponseV])

const tryGetProfile = (token: string): TaskEither<Error | Errors, GetProfileResponse> =>
  tryGetDecode([() => getProfile(token), GetProfileResponseV])

const tryGetSavedTracks = (token: string): TaskEither<Error | Errors, SavedTracksResponse> => 
  tryGetDecode([() => getSavedTracks(token), GetSavedTracksResponseV])

const tryGetSeveralArtists = (ids: string[]) => (token: string): TaskEither<Error | Errors, SeveralArtistsResponse> => 
  tryGetDecode([() => getSeveralArtists(ids)(token), GetSeveralArtistsResponseV])

const getImageFromAlbum: (a: Album) => string = flow(prop('images'), images => images[1].url)

const trackToSong = ({ name, artists, album, preview_url }: Track): Either<string, Song> => 
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

const createPlaylist = ({ id, name, items }: SpotifyPlaylistWithTracks): Playlist => ({
  id,
  name,
  songs: pipe(items.map(trackToSong), rights)
})

const createUserFromAPI = ({ id, display_name }: GetProfileResponse) => (spts: SpotifyPlaylistWithTracks[]): User => ({
  id,
  name: display_name,
  playlists: spts.map(createPlaylist)
})

// TODO: use traverse // this is wrong, it doesnt get playlist with the tracks. only returns the tracks after returning the playlist
const getUserPlaylistsWithTracks = (token: string): TaskEither<Error | Errors, GetPlaylistTracksResponse[]> => pipe(
  tryGetPlaylists(token),
  chain(flow(
    prop('items'),
    amap(({ id }) => tryGetPlaylistTracks(id)(token)),
    sequence(taskEither)
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
