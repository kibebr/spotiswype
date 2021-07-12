import { Seeds } from '../../domain/Seeds'
import { SpotifyAlbum, SpotifyArtist, SpotifyPlaylist, SpotifyTrack, SpotifyPlaylistWithTracks, SpotifySeeds } from './types'
import { Option, fromNullable } from 'fp-ts/Option'
import { flow, pipe } from 'fp-ts/function'
import { prop } from 'fp-ts-ramda'
import { unsafeHead, randomElements } from '../../utils/array'
import * as RA from 'fp-ts/ReadonlyArray'

export const getImageFromAlbum: (a: SpotifyAlbum) => string = flow(prop('images'), (images) => images[1].url)

export const getImageFromSpotifyPlaylist: (p: SpotifyPlaylist) => Option<string> = flow(
  prop('images'),
  RA.findFirstMap(flow(prop('url'), fromNullable))
)

export const mergeSpotifyPlaylistAndTracks = (sp: SpotifyPlaylist, trs: readonly SpotifyTrack[]): SpotifyPlaylistWithTracks => ({
  ...sp,
  tracks: trs
})

export const getRandomArtistsFromTrack: (tracks: readonly SpotifyTrack[]) => readonly SpotifyArtist[] = flow(
  RA.map(flow(prop('artists'), unsafeHead)),
  randomElements(5)
)

export const seedsToSpotifySeeds = ({ artists, songs, genres }: Seeds): SpotifySeeds => ({
  artistsIds: pipe(artists, RA.map(prop('id'))),
  tracksIds: pipe(songs, RA.map(prop('id'))),
  genres
})
