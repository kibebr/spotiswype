import { Playlist } from './Playlist'

export interface User {
  token: string
  id: string
  name: string
  playlists: readonly Playlist[]
}

export const getTokenFromUser = ({ token }: User): string => token
export const getPlaylistsFromUser = ({ playlists }: User): readonly Playlist[] => playlists
