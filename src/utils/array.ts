import { flow } from 'fp-ts/function'
import { sort, takeLeft } from 'fp-ts/ReadonlyArray'

export const randomElements = (n: number): <T>(arr: readonly T[]) => readonly T[] => flow(
  takeLeft(5)
)

export const unsafeHead = <T>(arr: readonly T[]): T => arr[0]
