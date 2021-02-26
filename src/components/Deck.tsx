import React from 'react'
import { Card } from './Card'
import { Song } from '../index'

interface DeckProps {
  songs: Song[]
}

export const Deck = ({ songs }: DeckProps): JSX.Element => {
  return (
    <>
      {songs.map((song, i) => (
        <Card
          id={`${songs.length - 1}`}
          song={song}
          style={{
            transform: `scale(${(20 - (songs.length - i)) / 20}) translateY(${(songs.length - i) * 20}px)`
          }}
        />
      ))}
    </>
  )
}
