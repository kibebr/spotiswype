import { Song } from './Song'

export interface Playlist {
  id: string
  name: string
  imageUrl?: string
  songs: readonly Song[]
}

export const getSongsFromPlaylist = ({ songs }: Playlist): readonly Song[] => songs
