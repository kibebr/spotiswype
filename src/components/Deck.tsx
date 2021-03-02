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
            transform: `scale(${((100 - ((songs.length - 1) - i) * 10) / 100)}) translateY(${((songs.length - 1) - i) * 50}px)`
          }}
        />
      ))}
    </>
  )
}
