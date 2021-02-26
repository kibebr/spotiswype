import React from 'react'
import { Song } from '../index'

interface CardProps {
  style: React.CSSProperties
  id: string
  song: Song
}

export const Card = ({ id, song, style }: CardProps): JSX.Element => {
  return (
    <div
      id={id}
      className='absolute flex-shrink-0 w-11/12 max-w-xs p-5 bg-red-500 bg-center bg-cover card test transition-transform md:w-6/12 rounded-3xl'
      style={{
        ...style,
        backgroundImage: `url(${song.imageUrl})`
      }}
    >
      {song.name} by {song.author}
    </div>
  )
}
