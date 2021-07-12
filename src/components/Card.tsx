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
      className='cursor-grab w-96 h-96 rounded-md'
      style={{
        backgroundImage: `url(${song.imageUrl})`
      }}
    >
    </div>
  )
}
