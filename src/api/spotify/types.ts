import { type, string, array, TypeOf, union, null as _null } from 'io-ts'

export const SpotifyArtistV = type({
  name: string,
  id: string
})

export const SpotifyAlbumV = type({
  images: array(type({
    url: string
  }))
})

export const SpotifyItemV = type({
  track: type({
    artists: array(SpotifyArtistV),
    id: string
  })
})

export const SpotifyTrackV = type({
  album: SpotifyAlbumV,
  artists: array(SpotifyArtistV),
  id: string,
  name: string,
  preview_url: union([_null, string]),
  external_urls: type({
    spotify: string
  })
})

export const SpotifyPlaylistV = type({
  id: string,
  name: string,
  images: array(type({
    url: string
  }))
})

export const GetPlaylistTracksResponseV = type({
  items: array(type({
    track: SpotifyTrackV
  }))
})

export const GetPlaylistsResponseV = type({
  items: array(SpotifyPlaylistV)
})

export const GetProfileResponseV = type({
  display_name: string,
  id: string
})

export const GetSeveralArtistsResponseV = type({
  artists: array(type({
    genres: array(string)
  }))
})

export const GetSavedTracksResponseV = type({
  items: array(SpotifyItemV)
})

export const GetRecommendationsResponseV = type({
  tracks: array(SpotifyTrackV)
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
export type SpotifyPlaylistWithTracks = SpotifyPlaylist & { tracks: SpotifyTrack[] }
