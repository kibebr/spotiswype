import React, { FunctionComponent } from 'react'
import { Song } from '../index'

interface SongCardProps {
  song: Song
}

export const SongCard: FunctionComponent<SongCardProps> = ({ song }) => (
  <a href={song.link}>
    <div className='flex flex-row items-center w-full h-24 p-5 mb-5 text-black rounded-2xl bg-purple-strong'>
      <div className='flex-shrink-0 w-16 h-16 mr-3 bg-cover rounded-full' style={{ backgroundImage: `url(${song.imageUrl})` }} />
      <div className='flex flex-col'>
        <span className='text-white'>{song.name}</span>
        <span className='text-gray-300'>by {song.author.name}</span>
      </div>
    </div>
  </a>
)
