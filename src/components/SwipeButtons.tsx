import React, { MouseEventHandler } from 'react'
import { ReactComponent as CrossIcon } from '../assets/cross.svg'
import { ReactComponent as PlayIcon } from '../assets/play-fill.svg'
import { ReactComponent as PauseIcon } from '../assets/pause-fill.svg'
import { ReactComponent as MarkIcon } from '../assets/check.svg'
import { Song } from '../domain/Song'
import * as IO from 'fp-ts/IO'

interface SwipeButtonsProps {
  isPlaying: boolean
  toggle: IO.IO<void>
  onSwipeRight: IO.IO<void>
  onSwipeLeft: IO.IO<void>
}

export const SwipeButtons = ({
  isPlaying,
  toggle,
  onSwipeRight,
  onSwipeLeft
}: SwipeButtonsProps): JSX.Element => {
  return (
    <div className='flex flex-row items-center justify-between px-5 py-3 bg-white rounded-full w-36 h-14'>
      <button
        onClick={onSwipeLeft}
        className="p-2 text-red-500 rounded transition-all hover:bg-red-500 hover:text-white"
      >
        <CrossIcon className="fill-current" width='16px' height='16px' />
      </button>
      <button
        onClick={toggle}
        className='p-1 rounded transition-all text-purple-strong hover:bg-purple-strong hover:text-white'
      >
        {isPlaying
          ? <PauseIcon width='24px' height='24px' />
          : <PlayIcon width='24px' height='24px' />
        }
      </button>
      <button
        onClick={onSwipeRight}
        className="p-2 text-green-500 rounded transition-all hover:bg-green-500 hover:text-white"
      >
        <MarkIcon className="fill-current" width='16px' height='16px' />
      </button>
    </div>
  )
}
