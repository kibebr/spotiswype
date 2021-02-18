import { map as temap, of, ap, chainEitherKW, chain  tryCatch, tryCatchK, TaskEither } from 'fp-ts/TaskEither'
import { map as amap, takeLeft } from 'fp-ts/Array'
import { pipe, flow } from 'fp-ts/function'
import { User } from './index'
import { 
  getProfile, 
  getSavedTracks, 
  getArtist,
  getRecommendedSongs
} from './services/SpotifyAPI'
import { getHashParams } from './utils'
import { type, Errors, string, array, TypeOf } from 'io-ts'
import { prop } from 'fp-ts-ramda'

const profileSpotifyResponse = type({
  name: string
})

const artistResponseV = type({
  id: string
})

const itemResponseV = type({
  artists: array(artistResponseV),
  id: string
})

const getSavedTracksResponse = type({
  items: array(itemResponseV)
})

type ItemResponse = TypeOf<typeof itemResponseV>
type ArtistResponse = TypeOf<typeof artistResponseV>
type SavedTracksResponse = TypeOf<typeof getSavedTracksResponse>

const get5Items: (t: SavedTracksResponse) => ItemResponse[] = flow(prop('items'), takeLeft(5)) 

const get5TracksIds = (savedTracks: SavedTracksResponse) => string[] = flow(
  get5Items,
  amap(item => item.id)
)

const get5ArtistsIds: (savedTracks: SavedTracksResponse) => string[] = flow(
  prop('items'),
  takeLeft(5),
  amap(item => item.artists[0].id)
)


/* const getSong = (href: string): Promise<unknown> => new Promise<unknown>((resolve, reject) => { */
/*   resolve({ play: '' }) */
/* }) */

/* export const getUserData = (ate: string): TaskEither<string | Errors, any> => pipe( */
/*   tryCatch( */
/*     () => getProfile(ate), */
/*     () => 'Could not fetch user.' */
/*   ), */
/*   chainEitherKW(profileSpotifyResponse.decode), */
/*   map(({ name }) => ({ name, savedSongs: [], token: 't' })) */
/* ) */

export const getRecommendations = ({ token }: User): TaskEither<unknown, string> => pipe(
  of(getRecommendedSongs),
  ap(of(token)),
  ap(of(['a'])),
  ap(of(['a'])),
  ap(of(['a'])),
  chain(promise => tryCatch(
    () => promise,
    (): unknown => ''
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
