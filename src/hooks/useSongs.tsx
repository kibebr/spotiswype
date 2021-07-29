import { useState } from 'react'
import { Song } from '../domain/Song'
import * as RA from 'fp-ts/ReadonlyArray'

type UseSongsReturn = [readonly Song[], {
  addSongs: (songs: readonly Song[]) => void,
  removeSong: (song: Song) => void,
  removeLast: () => void
}]

export const useSongs = (): UseSongsReturn => {
  const [songs, setSongs] = useState<readonly Song[]>([])

  return [songs, {
    addSongs: setSongs,
    removeSong: ({ id }: Song) => setSongs(RA.filter((song) => song.id !== id)),
    removeLast: () => setSongs(RA.dropLeft(1))
  }]
}
