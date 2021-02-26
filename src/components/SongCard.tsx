import React from 'react'
import { Song } from '../index'

interface SongCardProps {
  song: Song
}

export const SongCard = ({ song }: SongCardProps): JSX.Element => (
  <div className='flex flex-row items-center w-full h-24 p-5 mb-5 text-black rounded-2xl bg-purple-strong'>
    <div className='flex-shrink-0 mr-3 bg-cover rounded-full w-14 h-14' style={{ backgroundImage: `url(${song.imageUrl})` }} />
    <div className='flex flex-col'>
      <span className='text-white'>{song.name}</span>
      <span className='text-gray-300'>by {song.author.name}</span>
    </div>
  </div>
)
