import React from 'react'
import { Card } from './Card'
import { Song } from '../index'

type DeckProps = {
  songs: Song[]
}

export const Deck = ({ songs }: DeckProps): JSX.Element => {

  return (
    <>
      {songs.map((song, i) => (
        <Card 
          song={song} 
          style={{
            transform: `scale(${(20 - (songs.length - i)) / 20}) translateY(${30 * songs.length - i}px)`
          }} 
        />
      ))}
    </>
  )
}
