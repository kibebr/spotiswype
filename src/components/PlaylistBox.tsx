import React from 'react'
import { Playlist } from '../index'

interface PlaylistBoxProps {
  playlist: Playlist
}

export const PlaylistBox = ({ playlist }: PlaylistBoxProps): JSX.Element => {
  return (
    <button
      className='flex-1 flex-shrink-0 shadow-lg bg-gray-300 bg-center bg-cover rounded-lg w-36 h-36'
      style={{
        ...(playlist.imageUrl !== '' && { backgroundImage: `url(${playlist.imageUrl})` })
      }}
    >
    </button>
  )
}
