import { useState } from 'react'
import { Seeds } from '../domain/Seeds'
import { Song } from '../domain/Song'
import { Author } from '../domain/Author'

const defaultSeeds: Seeds = {
  artists: [],
  songs: [],
  genres: []
}

type UseSeeds = [Seeds, {
  addArtistToSeeds: (artist: Author) => void,
  addSongToSeeds: (song: Song) => void,
  addGenreToSeeds: (genre: string) => void
}]

export const useSeeds = (): UseSeeds => {
  const [seeds, setSeeds] = useState<Seeds>(defaultSeeds)

  return [seeds, {
    addArtistToSeeds: (artist) => setSeeds((seeds) => ({
      ...seeds,
      artists: seeds.artists.concat(artist)
    })),
    addSongToSeeds: (song) => setSeeds((seeds) => ({
      ...seeds,
      songs: seeds.songs.concat(song)
    })),
    addGenreToSeeds: (genre) => setSeeds((seeds) => ({
      ...seeds,
      genres: seeds.genres.concat(genre)
    }))
  }]
}
