/* eslint-disable @typescript-eslint/naming-convention */

import { rights } from 'fp-ts/lib/Array'
import { pipe } from 'fp-ts/lib/function'
import { left, right, Either } from 'fp-ts/lib/Either'
import { Song, User, Playlist, Author } from '../../index'
import { GetProfileResponse, SpotifyTrack, SpotifyPlaylistWithTracks, SpotifyArtist } from './types'
import { getImageFromAlbum } from './spotifyapi'

export const spotifyArtistToAuthor = ({ id, name }: SpotifyArtist): Author => ({
  id,
  name
})

export const trackToSong = ({ id, name, artists, album, preview_url }: SpotifyTrack): Either<string, Song> =>
  preview_url === null
    ? left("This track can't be converted to a Song.")
    : right(({
      id,
      name,
      author: pipe(artists[0], spotifyArtistToAuthor),
      audio: new Audio(preview_url),
      imageUrl: getImageFromAlbum(album)
    }))

export const createDomainPlaylist = ({ id, name, tracks }: SpotifyPlaylistWithTracks): Playlist => ({
  id,
  name,
  songs: pipe(tracks.map(trackToSong), rights)
})

export const createUserFromAPI = ({ id, display_name }: GetProfileResponse) => (spts: SpotifyPlaylistWithTracks[]): User => ({
  id,
  name: display_name,
  playlists: spts.map(createDomainPlaylist)
})
