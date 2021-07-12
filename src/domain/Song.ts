import { Author, AuthorV } from './Author'
import * as t from 'io-ts'

export const SongV = t.type({
  id: t.string,
  name: t.string,
  author: AuthorV,
  audio: t.string,
  imageUrl: t.string,
  link: t.string
})

export const SongVArray = t.readonlyArray(SongV)

export type Song = t.TypeOf<typeof SongV>

export const getArtistFromSong = ({ author }: Song): Author => author
