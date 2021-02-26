import React from 'react'
import { Song } from '../index'

type CardProps = {
  style: React.CSSProperties
  song: Song
}

export const Card = ({ song, style }: CardProps): JSX.Element => {
  return (
    <div 
      className='absolute flex-shrink-0 w-11/12 p-5 bg-red-500 bg-center bg-cover card test transition-transform md:w-6/12 rounded-3xl'
      style={{
        ...style,
        backgroundImage: `${song.imageUrl}`
      }}
    >
      {song.name} by {song.author}
    </div>
  )
}
