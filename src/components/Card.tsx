import React from 'react'
import { Song } from '../domain/Song'
import { ReactComponent as Cross } from '../assets/cross.svg'
import { ReactComponent as Mark } from '../assets/mark.svg'
import { ReactComponent as Play } from '../assets/play-fill.svg'

interface CardProps {
  song: Song
}

export const Card = ({ song }: CardProps): JSX.Element => {
  return (
    <div
      className='cursor-grab w-96 h-96'
      style={{
        backgroundImage: `url(${song.imageUrl})`
      }}
    >
      <div className='flex flex-col justify-between'>
        <div className='p-3 text-center text-black rounded-lg bg-blur'>
          {song.name} <span className='text-gray-700'>by {song.author.name}</span>
        </div>
      </div>
    </div>
  )
}
