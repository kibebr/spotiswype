import { map as temap, of, ap, chain, chainEitherKW, chainW, apW, tryCatch, TaskEither, Do, bind } from 'fp-ts/TaskEither'
import { map as amap, filter, takeLeft } from 'fp-ts/Array'
import { pipe, flow, Lazy } from 'fp-ts/function'
import { toError } from 'fp-ts/Either'
import { Song } from '../index'
import {
  getSavedTracks,
  getSeveralArtists,
  getRecommendedSongs
} from '../services/SpotifyAPI'
import { type, string, array, TypeOf, union, null as _null, Errors } from 'io-ts'
import { prop } from 'fp-ts-ramda'

const fromThunk = <A>(thunk: Lazy<Promise<A>>): TaskEither<Error, A> => tryCatch(thunk, toError)

const getSeveralArtistsResponseV = type({
  artists: array(type({
    genres: array(string)
  }))
})

const artistResponseV = type({
  id: string
})

const itemResponseV = type({
  track: type({
    artists: array(artistResponseV),
    id: string
  })
})

const getSavedTracksResponse = type({
  items: array(itemResponseV)
})

const getRecommendationsResponse = type({
  tracks: array(type({
    album: type({
      images: array(type({
        url: string
      }))
    }),
    name: string,
    preview_url: union([string, _null])
  }))
})

type ItemResponse = TypeOf<typeof itemResponseV>
type ArtistResponse = TypeOf<typeof artistResponseV>
type SavedTracksResponse = TypeOf<typeof getSavedTracksResponse>
type SeveralArtistsResponse = TypeOf<typeof getSeveralArtistsResponseV>
type RecommendationsResponse = TypeOf<typeof getRecommendationsResponse>

const get5Items: (t: SavedTracksResponse) => ItemResponse[] = flow(prop('items'), takeLeft(2))

const get5Artists: (savedTracks: SavedTracksResponse) => ArtistResponse[] = flow(
  get5Items,
  amap(item => item.track.artists[0])
)

const tryGetSavedTracks = (token: string): TaskEither<Error | Errors, SavedTracksResponse> => pipe(
  fromThunk(async () => await getSavedTracks(token)),
  chainEitherKW(getSavedTracksResponse.decode)
)

const tryGetSeveralArtists = (ids: string[]) => (token: string): TaskEither<Error | Errors, SeveralArtistsResponse> => pipe(
  fromThunk(async () => await getSeveralArtists(ids)(token)),
  chainEitherKW(getSeveralArtistsResponseV.decode)
)

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
  chainEitherKW(getRecommendationsResponse.decode)
)

export const getSongs: (token: string) => TaskEither<Error | Errors, Song[]> = flow(
  getRecommendations,
  temap(flow(
    prop('tracks'),
    filter(({ preview_url }) => typeof preview_url === 'string'),
    amap(({ name, preview_url, album }) => ({
      name,
      audio: new Audio(preview_url as string),
      imageUrl: album.images[1].url
    }))
  ))
)
