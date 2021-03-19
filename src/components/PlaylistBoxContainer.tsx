import React from 'react'

interface PlaylistBoxContainerProps {
  playlistName: string
  children: React.ReactNode
}

export const PlaylistBoxContainer = ({ playlistName, children }: PlaylistBoxContainerProps): JSX.Element => {
  return (
    <div className='text-center'>
      {children}
      <h3 className='text-black'>{playlistName}</h3>
    </div>
  )
}
