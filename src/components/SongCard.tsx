import React from 'react'

interface SongCardProps {
  name: string
  author: string
  imageUrl: string
}

export const SongCard = ({ name, author, imageUrl }: SongCardProps): JSX.Element => (
  <div className='flex flex-row items-center w-full h-24 p-5 mb-5 text-black bg-gray-300 rounded-lg'>
    <div className='flex-shrink-0 mr-3 bg-cover rounded-lg w-14 h-14' style={{ backgroundImage: `url(${imageUrl})` }} />
    <div>
      {name} by {author}
    </div>
  </div>
)
