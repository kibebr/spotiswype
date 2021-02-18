import { map as temap, of, ap, chain, chainEitherKW, tryCatch, TaskEither, Do, bind } from 'fp-ts/TaskEither'
import { map as amap, filter, takeLeft } from 'fp-ts/Array'
import { pipe, flow, not } from 'fp-ts/function'
import { User, Song } from './index'
import { 
  getSavedTracks, 
  getSeveralArtists,
  getRecommendedSongs
} from './services/SpotifyAPI'
import { type, string, array, TypeOf, union, null as _null } from 'io-ts'
import { prop } from 'fp-ts-ramda'

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
    name: string,
    preview_url: union([string, _null])
  }))
})

type ItemResponse = TypeOf<typeof itemResponseV>
type ArtistResponse = TypeOf<typeof artistResponseV>
type SavedTracksResponse = TypeOf<typeof getSavedTracksResponse>
type RecommendationsResponse = TypeOf<typeof getRecommendationsResponse>

const get5Items: (t: SavedTracksResponse) => ItemResponse[] = flow(prop('items'), takeLeft(2)) 

const get5Artists: (savedTracks: SavedTracksResponse) => ArtistResponse[] = flow(
  get5Items,
  amap(item => item.track.artists[0])
)

export const getRecommendations = ({ token }: User): TaskEither<unknown, RecommendationsResponse> => pipe(
  Do,
  bind('favoriteTracks', () => tryCatch(
    () => getSavedTracks(token),
    (): unknown => 'Uh oh, there was a problem while fetching for your favorite tracks! Please contact the developer.'
  )),
  chainEitherKW(({ favoriteTracks }) => getSavedTracksResponse.decode(favoriteTracks)),
  chain((savedTracks) => pipe(
    of(getRecommendedSongs),
    ap(of(pipe(
      get5Items(savedTracks),
      amap(flow(prop('track'), prop('id')))
    ))),
    ap(of(pipe(
      get5Artists(savedTracks), 
      amap(prop('id'))
    ))),
    ap(pipe(
      get5Artists(savedTracks),
      amap(prop('id')),
      (ids) => tryCatch(
        () => getSeveralArtists(ids)(token),
        (): unknown => 'Uh oh, there was a problem while fetching for the artists! Please contact the developer.'
      ),
      chainEitherKW(getSeveralArtistsResponseV.decode),
      temap(flow(prop('artists'), amap(a => a.genres[0])))
    )),
    ap(of(token)),
    chain(promise => tryCatch(
      () => promise,
      (): unknown => 'Uh oh, there was a problem while fetching for the recommended songs! Please contact the developer.'
    ))
  )),
  chainEitherKW(getRecommendationsResponse.decode)
)

export const getSongs: ({ token }: User) => TaskEither<unknown, Song[]> = flow(
  getRecommendations,
  temap(flow(
    prop('tracks'),
    filter(({ preview_url }) => typeof preview_url === 'string'),
    amap(({ name, preview_url }) => ({ name, previewUrl: preview_url } as Song))
  ))
)

  /* tryCatch( */
  /*   () => getSavedTracks(token), */
  /*   () => 'Could not fetch saved songs.' */
  /* ), */
  /* chainEitherKW(getSavedTracksResponse.decode), */
  /* temap(flow( */
  /*   prop('items'), */
  /*   amap(x => x.artists[0].id), */
  /*   amap(getGenresOfArtist) */
  /* )), */
