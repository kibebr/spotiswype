import { type, readonly, string, readonlyArray, TypeOf, union, null as _null } from 'io-ts'

export const SpotifyArtistV = type({
  name: string,
  id: string
})

export const SpotifyAlbumV = type({
  images: readonlyArray(type({
    url: string
  }))
})

export const SpotifyTrackV = type({
  album: SpotifyAlbumV,
  artists: readonlyArray(SpotifyArtistV),
  id: string,
  name: string,
  preview_url: union([_null, string]),
  external_urls: type({
    spotify: string
  })
})

export const SpotifyItemV = type({
  track: SpotifyTrackV
})

export const SpotifyPlaylistV = type({
  id: string,
  name: string,
  images: readonlyArray(type({
    url: string
  }))
})

export const GetPlaylistTracksResponseV = type({
  items: readonlyArray(type({
    track: SpotifyTrackV
  }))
})

export const GetFeaturedPlaylistsResponseV = type({
  playlists: readonlyArray(SpotifyPlaylistV)
})

export const GetPlaylistsResponseV = type({
  items: readonlyArray(SpotifyPlaylistV)
})

export const GetProfileResponseV = type({
  display_name: string,
  id: string
})

export const GetSeveralArtistsResponseV = type({
  artists: readonlyArray(type({
    genres: readonlyArray(string)
  }))
})

export const GetSavedTracksResponseV = type({
  items: readonlyArray(SpotifyItemV)
})

export const GetRecommendationsResponseV = type({
  tracks: readonlyArray(SpotifyTrackV)
})

export type GetPlaylistTracksResponse = TypeOf<typeof GetPlaylistTracksResponseV>
export type GetPlaylistsResponse = TypeOf<typeof GetPlaylistsResponseV>
export type GetProfileResponse = TypeOf<typeof GetProfileResponseV>
export type SpotifyTrack = TypeOf<typeof SpotifyTrackV>
export type SpotifyItem = TypeOf<typeof SpotifyItemV>
export type SpotifyArtist = TypeOf<typeof SpotifyArtistV>
export type SpotifyAlbum = TypeOf<typeof SpotifyAlbumV>
export type SpotifyPlaylist = TypeOf<typeof SpotifyPlaylistV>
export type SavedTracksResponse = TypeOf<typeof GetSavedTracksResponseV>
export type SeveralArtistsResponse = TypeOf<typeof GetSeveralArtistsResponseV>
export type RecommendationsResponse = TypeOf<typeof GetRecommendationsResponseV>
export type SpotifyPlaylistWithTracks = SpotifyPlaylist & { tracks: readonly SpotifyTrack[] }

export interface SpotifySeeds {
  readonly artistsIds: readonly string[]
  readonly tracksIds: readonly string[]
  readonly genres: readonly string[]
}
