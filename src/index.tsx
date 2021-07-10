/* eslint-disable @typescript-eslint/no-floating-promises */

import React, { useEffect, useState } from 'react'
import * as IO from 'fp-ts/IO'
import * as TE from 'fp-ts/TaskEither'
import * as RA from 'fp-ts/ReadonlyArray'
import * as O from 'fp-ts/Option'
import * as E from 'fp-ts/Either'
import * as F from 'fp-ts/function'
import * as Eq from 'fp-ts/Eq'
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

const ioVoid: IO.IO<void> = () => {}

export type SwipeDirection
  = 'LEFT'
  | 'RIGHT'

interface HomeProps {
  playSong: (song: Song) => IO.IO<void>
  resume: IO.IO<void>
  pause: IO.IO<void>
  toggle: IO.IO<void>
}

const Home = ({ playSong, toggle }: HomeProps): JSX.Element => {
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
    F.pipe(songs, RA.head, O.fold(F.constant(ioVoid), playSong))()

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

      <button onClick={toggle}>
        Play
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
    }
  }, [currentSong])

  return (
    <>
      <Home
        playSong={(song) => () => setCurrentSong(O.some(song))}
        resume={() => setIsPlaying(true)}
        pause={() => setIsPlaying(false)}
        toggle={() => setIsPlaying(!isPlaying)}
      />
    </>
  )
}

render(<AudioManager />, document.getElementById('root'))
