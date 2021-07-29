import { usePalette } from 'react-palette'
import { Song } from '../domain/Song'
import { prop } from 'fp-ts-ramda'
import * as F from 'fp-ts/function'
import * as RA from 'fp-ts/ReadonlyArray'
import * as O from 'fp-ts/Option'

type UseBackgroundColorProps = {
  songs: readonly Song[]
}

type UseBackground = {
  color: string
}

export const useBackgroundColor = ({ songs }: UseBackgroundColorProps): UseBackground => {
  const { data } = usePalette(F.pipe(
    songs,
    RA.head,
    O.map(prop('imageUrl')),
    O.getOrElse(() => '')
  ))

  return { color: data.vibrant as string }
}
