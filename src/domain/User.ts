import { Playlist } from './Playlist'
export interface User {
  token: string
  id: string
  name: string
  playlists: Playlist[]
}
