/* eslint-disable @typescript-eslint/naming-convention */

import { rights } from 'fp-ts/lib/Array'
import { pipe, constant } from 'fp-ts/lib/function'
import { left, right, Either } from 'fp-ts/lib/Either'
import { getOrElse } from 'fp-ts/lib/Option'
import { Song, User, Playlist, Author } from '../../index'
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
      audio: new Audio(preview_url),
      imageUrl: getImageFromAlbum(album),
      link: external_urls.spotify
    }))

export const createDomainPlaylist = (spt: SpotifyPlaylistWithTracks): Playlist => ({
  id: spt.id,
  name: spt.name,
  imageUrl: pipe(getImageFromSpotifyPlaylist(spt), getOrElse(constant(''))),
  songs: pipe(spt.tracks.map(trackToSong), rights)
})

export const createUserFromAPI = (token: string) => ({ id, display_name }: GetProfileResponse) => (spts: SpotifyPlaylistWithTracks[]): User => ({
  token,
  id,
  name: display_name,
  playlists: spts.map(createDomainPlaylist)
})
