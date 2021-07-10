/* eslint-disable @typescript-eslint/naming-convention */

import * as E from 'fp-ts/Either'
import * as RA from 'fp-ts/ReadonlyArray'
import { Reader } from 'fp-ts/Reader'
import { pipe, constant } from 'fp-ts/function'
import { getOrElse } from 'fp-ts/Option'
import { Song } from '../../domain/Song'
import { User } from '../../domain/User'
import { Author } from '../../domain/Author'
import { Playlist } from '../../domain/Playlist'
import { prop } from 'fp-ts-ramda'
import { GetProfileResponse, SpotifyTrack, SpotifyPlaylistWithTracks, SpotifyArtist } from './types'
import { getImageFromAlbum, getImageFromSpotifyPlaylist } from './spotifyapi'

export const spotifyArtistToAuthor = ({ id, name }: SpotifyArtist): Author => ({
  id,
  name
})

export const trackToSong = ({ id, name, artists, album, preview_url, external_urls }: SpotifyTrack): E.Either<string, Song> =>
  preview_url === null
    ? E.left("This track can't be converted to a Song.")
    : E.right(({
      id,
      name,
      author: pipe(artists[0], spotifyArtistToAuthor),
      audio: preview_url,
      imageUrl: getImageFromAlbum(album),
      link: external_urls.spotify
    }))

export const spotifyTracksToSongs: (tracks: readonly SpotifyTrack[]) => E.Either<string, readonly Song[]> = E.traverseArray(trackToSong)

export const createDomainPlaylist = (spt: SpotifyPlaylistWithTracks): Playlist => ({
  id: spt.id,
  name: spt.name,
  imageUrl: pipe(
    spt,
    getImageFromSpotifyPlaylist,
    getOrElse(constant(''))
  ),
  songs: pipe(
    spt,
    prop('tracks'),
    RA.map(trackToSong),
    RA.rights
  )
})

export const createUserFromAPI =
  ({ id, display_name }: GetProfileResponse) =>
    (spts: readonly SpotifyPlaylistWithTracks[]): Reader<string, User> =>
      (token) =>
        ({
          token,
          id,
          name: display_name,
          playlists: spts.map(createDomainPlaylist)
        })
