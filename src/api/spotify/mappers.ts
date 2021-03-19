/* eslint-disable @typescript-eslint/naming-convention */

import { map, rights } from 'fp-ts/Array'
import { pipe, constant } from 'fp-ts/function'
import { left, right, Either } from 'fp-ts/Either'
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

export const trackToSong = ({ id, name, artists, album, preview_url, external_urls }: SpotifyTrack): Either<string, Song> =>
  preview_url === null
    ? left("This track can't be converted to a Song.")
    : right(({
      id,
      name,
      author: pipe(artists[0], spotifyArtistToAuthor),
      audio: preview_url,
      imageUrl: getImageFromAlbum(album),
      link: external_urls.spotify
    }))

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
    map(trackToSong),
    rights
  )
})

export const createUserFromAPI = (token: string) => ({ id, display_name }: GetProfileResponse) => (spts: SpotifyPlaylistWithTracks[]): User => ({
  token,
  id,
  name: display_name,
  playlists: spts.map(createDomainPlaylist)
})
