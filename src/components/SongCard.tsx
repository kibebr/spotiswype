import React, { FunctionComponent } from 'react'
import { ReactComponent as Cross } from '../assets/cross.svg'
import { Song } from '../domain/Song'

interface SongCardProps {
  song: Song
}

export const SongCard: FunctionComponent<SongCardProps> = ({ song }) => {
  return (
    <div className='flex flex-row items-center w-full h-24 p-5 mb-5 text-black rounded-2xl bg-white shadow-2xl'>
      <a href={song.link} className='flex flex-row items-center'>
        <div className='flex-shrink-0 w-16 h-16 mr-3 bg-cover rounded-full' style={{ backgroundImage: `url(${song.imageUrl})` }} />
        <div className='flex flex-col'>
          <span className='text-black'>{song.name}</span>
          <span className='text-gray-500'>by {song.author.name}</span>
        </div>
      </a>
      <button className='relative flex-shrink-0 w-10 h-10 ml-auto rounded-full md:w-12 md:h-12 bg-red-600 text-white transition-colors hover:animate-bounce'>
        <Cross className='absolute w-5 h-5 fill-current inset-center'/>
      </button>
    </div>
  )
}
