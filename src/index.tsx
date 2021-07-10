/* eslint-disable @typescript-eslint/no-floating-promises */

import React, { useEffect, useState } from 'react'
import * as IO from 'fp-ts/IO'
import * as TE from 'fp-ts/TaskEither'
import * as RA from 'fp-ts/ReadonlyArray'
import * as O from 'fp-ts/Option'
import * as E from 'fp-ts/Either'
import * as F from 'fp-ts/function'
import { ADT, matchI } from 'ts-adt'
import { render } from 'react-dom'
import { SongCard } from './components/SongCard'
import { Container } from './components/Container'
import { Deck } from './components/Deck'
import { LoadingIndicator } from './components/LoadingIndicator'
import { ReactComponent as CrossIcon } from './assets/cross.svg'
import { ReactComponent as SpotifyIcon } from './assets/spotify.svg'
import { SwipeButtons } from './components/SwipeButtons'
import { getRecommendedFromPlaylist, getRecommendedFromLikedSongs } from './api/spotify/spotifyapi'
import { dropRight } from 'fp-ts/Array'
import { handleLogin, handleFetchUser } from './api/spotify/login'
import { createSwipeable } from './swipehandler'
import { usePalette } from 'react-palette'
import { Playlist } from './domain/Playlist'
import { User, getTokenFromUser } from './domain/User'
import { Song } from './domain/Song'
import './index.css'

export type SwipeDirection
  = 'LEFT'
  | 'RIGHT'

interface HomeProps {
  playSong: (song: Song) => IO.IO<void>
  resume: IO.IO<void>
  pause: IO.IO<void>
}

const Home = ({ playSong }: HomeProps): JSX.Element => {
  const [user, setUser] = useState<O.Option<User>>(O.none)
  const [songs, setSongs] = useState<readonly Song[]>([])
  const [preference] = useState<ADT<{
    Liked: {}
    Playlist: { playlist: Playlist }
  }>>({ _type: 'Liked' })

  const loadSongs = F.pipe(
    user,
    O.map(getTokenFromUser),
    TE.fromOption(F.constVoid),
    TE.chainW(matchI(preference)({
      Liked: () => getRecommendedFromLikedSongs,
      Playlist: ({ playlist }) => getRecommendedFromPlaylist(playlist)
    }))
  )

  useEffect(() => {
    if (songs.length <= 0 && O.isSome(user)) {
      loadSongs().then(E.fold(console.error, setSongs))
    }
  }, [user, songs])

  useEffect(() => {
    handleFetchUser().then(E.fold(console.error, F.flow(O.some, setUser)))
  }, [])

  return (
    <div>
      {F.pipe(
        user,
        O.fold(
          () => <>No user logged in.</>,
          (user) => <div>{user.name}</div>
        )
      )}

      {F.pipe(
        songs,
        RA.map((song) => (
          <div
            key={song.id}
            onClick={() => setSongs(RA.filter((_song) => _song !== song))}
          >
            {song.name}
          </div>
        ))
      )}

      <button onClick={handleLogin}>
        Log-in
      </button>
    </div>
  )
}

const AudioManager = (): JSX.Element => {
  const [currentSong, setCurrentSong] = useState<O.Option<Song>>(O.none)
  const [audio, setAudio] = useState<O.Option<HTMLAudioElement>>(O.none)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)

  useEffect(() => {
    if (O.isSome(audio)) {
      audio.value.addEventListener('ended', () => setIsPlaying(false))
    }
  }, [audio])

  useEffect(() => {
    if (O.isSome(audio)) {
      isPlaying ? audio.value.play() : audio.value.pause()
    }
  }, [isPlaying, audio])

  useEffect(() => {
    if (O.isSome(audio)) {
      audio.value.pause()
    }

    if (O.isSome(currentSong)) {
      setAudio(O.some(new Audio(currentSong.value.audio)))
      setIsPlaying(true)
    }
  }, [currentSong])

  return (
    <>
      <Home
        playSong={(song) => () => setCurrentSong(O.some(song))}
        resume={() => setIsPlaying(true)}
        pause={() => setIsPlaying(false)}
      />
    </>
  )
}

render(<AudioManager />, document.getElementById('root'))
