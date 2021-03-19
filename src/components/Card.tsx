import React from 'react'
import { Song } from '../domain/Song'
import { ReactComponent as Cross } from '../assets/cross.svg'
import { ReactComponent as Mark } from '../assets/mark.svg'
import { ReactComponent as Play } from '../assets/play-fill.svg'

interface CardProps {
  style: React.CSSProperties
  id: string
  song: Song
}

export const Card = ({ id, song, style }: CardProps): JSX.Element => {
  return (
    <div
      id={id}
      className='absolute cursor-grab flex-shrink-0 w-9/12 max-w-xs p-5 bg-center bg-cover h-5/6 bg-purple-strong card transition-transform md:w-6/12 rounded-3xl shadow-2xl'
      style={{
        ...style,
        backgroundImage: `url(${song.imageUrl})`,
        boxShadow: 'rgba(100, 100, 111, 0.2) 0px 7px 29px 0px'
      }}
    >
      <div className='flex flex-col justify-between h-auto'>
        <div className='p-3 text-center text-black rounded-lg bg-blur'>
          {song.name} <span className='text-gray-700'>by {song.author.name}</span>
        </div>
      </div>
    </div>
  )
}
