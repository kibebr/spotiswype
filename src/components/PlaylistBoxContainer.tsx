import React from 'react'
import { PlaylistBox } from './PlaylistBox'
import { Playlist } from '../index'

interface PlaylistBoxContainerProps {
  playlist: Playlist
}

export const PlaylistBoxContainer = ({ playlist }: PlaylistBoxContainerProps): JSX.Element => {
  return (
    <div className='text-center'>
      <PlaylistBox playlist={playlist} />
      <h3 className='text-black'>{playlist.name}</h3>
    </div>
  )
}
