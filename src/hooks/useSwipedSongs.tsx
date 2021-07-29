import { useEffect, useState } from 'react'
import { Song } from '../domain/Song'
import * as F from 'fp-ts/function'
import * as RA from 'fp-ts/ReadonlyArray'
import * as E from 'fp-ts/Either'
import { getCachedLikedSongs, setCachedLikedSongs } from '../services/likedSongs'

type UseSwipedSongs = [readonly Song[], {
  addSongToSwiped: (song: Song) => void
}]

export const useSwipedSongs = (): UseSwipedSongs => {
  const [swipedSongs, setSwipedSongs] = useState<readonly Song[]>(
    F.pipe(
      getCachedLikedSongs(),
      E.getOrElseW(() => [])
    )
  )

  useEffect(() => {
    setCachedLikedSongs(swipedSongs)()
  }, [swipedSongs])

  return [swipedSongs, {
    addSongToSwiped: (song) => setSwipedSongs(RA.append(song))
  }]
}
