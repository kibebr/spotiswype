import { map as temap, of, ap, chain, chainEitherKW, tryCatch, TaskEither, Do, bind } from 'fp-ts/TaskEither'
import { map as amap, takeLeft } from 'fp-ts/Array'
import { pipe, flow } from 'fp-ts/function'
import { User } from './index'
import { 
  getSavedTracks, 
  getSeveralArtists,
  getRecommendedSongs
} from './services/SpotifyAPI'
import { type, string, array, TypeOf } from 'io-ts'
import { prop } from 'fp-ts-ramda'

const profileSpotifyResponse = type({
  name: string
})

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

type ItemResponse = TypeOf<typeof itemResponseV>
type ArtistResponse = TypeOf<typeof artistResponseV>
type SavedTracksResponse = TypeOf<typeof getSavedTracksResponse>

const get5Items: (t: SavedTracksResponse) => ItemResponse[] = flow(prop('items'), takeLeft(2)) 

const get5Artists: (savedTracks: SavedTracksResponse) => ArtistResponse[] = flow(
  get5Items,
  amap(item => item.track.artists[0])
)

// i put pipe on the last ap because u gonna have to decode it later
export const getRecommendations = ({ token }: User): TaskEither<unknown, any> => pipe(
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
