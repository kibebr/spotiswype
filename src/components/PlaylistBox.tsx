import React, { FunctionComponent } from 'react'
import { Playlist } from '../domain/Playlist'

interface PlaylistBoxProps {
  playlist: Playlist
  onClick: () => unknown
}

export const PlaylistBox: FunctionComponent<PlaylistBoxProps> = ({ playlist, onClick }) => {
  return (
    <button
      className='flex-shrink-0 bg-gray-300 bg-center bg-cover rounded-lg shadow-lg w-36 h-36 hover:opacity-80 transition-opacity'
      style={{
        ...(playlist.imageUrl !== '' && { backgroundImage: `url(${playlist.imageUrl})` })
      }}
      onClick={onClick}
    >
    </button>
  )
}
