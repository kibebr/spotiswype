import { Author } from './Author'

export interface SongProps {
  id: string
  name: string
  author: Author
  imageUrl: string
  link: string
}

export interface Song {
  id: string
  name: string
  author: Author
  audio: string
  imageUrl: string
  link: string
}
