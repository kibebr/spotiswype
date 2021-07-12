import { Author } from './Author'
import { Song } from './Song'

export interface Seeds {
  readonly artists: readonly Author[]
  readonly songs: readonly Song[]
  readonly genres: readonly string[]
}
