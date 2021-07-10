/* eslint-disable @typescript-eslint/promise-function-async */
/* eslint-disable @typescript-eslint/no-floating-promises */

import React, { useEffect, useState } from 'react'
import * as IO from 'fp-ts/IO'
import * as TE from 'fp-ts/TaskEither'
import * as RA from 'fp-ts/ReadonlyArray'
import * as O from 'fp-ts/Option'
import * as E from 'fp-ts/Either'
import * as F from 'fp-ts/function'
import TinderCard from 'react-tinder-card'
import { ADT, matchI } from 'ts-adt'
import { render } from 'react-dom'
import { Card } from './components/Card'
import { prop } from 'fp-ts-ramda'
import { SwipeButtons } from './components/SwipeButtons'
import { getRecommendedFromPlaylist, getRecommendedFromLikedSongs } from './api/spotify/spotifyapi'
import { handleLogin, handleFetchUser } from './api/spotify/login'
import { Playlist } from './domain/Playlist'
import { User, getTokenFromUser, getPlaylistsFromUser } from './domain/User'
import { usePalette } from 'react-palette'
import { Song } from './domain/Song'
import './index.css'

const ioVoid: IO.IO<void> = () => {}

export type SwipeDirection
  = 'LEFT'
  | 'RIGHT'

interface HomeProps {
  isPlaying: boolean
  playSong: (song: Song) => IO.IO<void>
  resume: IO.IO<void>
  pause: IO.IO<void>
  toggle: IO.IO<void>
}

const Header = ({ user, handleLogin }: { user: O.Option<User>, handleLogin: IO.IO<void> }): JSX.Element => {
  return (
    <header className='flex justify-between opacity-90 items-center'>
      <div>
        <h1 className='font-bold text-3xl italic'>
          spotiswype
        </h1>
      </div>
      {F.pipe(
        user,
        O.fold(
          () => <button onClick={handleLogin}>Log-in.</button>,
          (user) => <div className='font-bold text-xl'>Logged in as {user.name}</div>
        )
      )}
    </header>
  )
}

const Home = ({ isPlaying, playSong, toggle }: HomeProps): JSX.Element => {
  const [user, setUser] = useState<O.Option<User>>(O.none)
  const [songs, setSongs] = useState<readonly Song[]>([])
  const [swipedSongs, setSwipedSongs] = useState<readonly Song[]>([])
  const [preference, setPreference] = useState<ADT<{
    Liked: {}
    Playlist: { playlist: Playlist }
  }>>({ _type: 'Liked' })
  const { data } = usePalette(F.pipe(songs, RA.head, O.map(prop('imageUrl')), O.getOrElse(F.constant(''))))

  const loadSongs = F.pipe(
    user,
    O.map(getTokenFromUser),
    TE.fromOption(F.constVoid),
    TE.chainW(matchI(preference)({
      Liked: () => getRecommendedFromLikedSongs,
      Playlist: ({ playlist }) => getRecommendedFromPlaylist(playlist)
    }))
  )

  const refresh = (): Promise<void> => loadSongs().then(E.fold(console.error, setSongs))

  const swipeLeft: IO.IO<void> = () => {
    setSongs(RA.dropLeft(1))
  }

  const swipeRight = (song: Song): IO.IO<void> => () => {
    setSongs(RA.dropLeft(1))
    setSwipedSongs(RA.append(song))
  }

  useEffect(() => {
    F.pipe(songs, RA.head, O.fold(F.constant(ioVoid), playSong))()

    if (songs.length <= 0 && O.isSome(user)) {
      refresh()
    }
  }, [user, songs])

  useEffect(() => { refresh() }, [preference])

  useEffect(() => {
    handleFetchUser().then(E.fold(console.error, F.flow(O.some, setUser)))
  }, [])

  return (
    <div className='p-4 h-full transition-colors' style={{ backgroundColor: data?.vibrant }}>
      <Header
        user={user}
        handleLogin={handleLogin}
      />

      <div className='my-8' />

      <div className='flex justify-center'>
        {F.pipe(
          songs,
          RA.reverse,
          RA.map((song) => (
            <div className='absolute'>
              <TinderCard
                key={song.id}
                onSwipe={(dir) => dir === 'left' ? swipeLeft() : swipeRight(song)()}
                onCardLeftScreen={F.constVoid}
              >
                <Card song={song} />
              </TinderCard>
            </div>
          ))
        )}

        <SwipeButtons
          isPlaying={isPlaying}
          toggle={toggle}
          onSwipeLeft={swipeLeft}
          onSwipeRight={swipeRight(songs[0])}
        />
      </div>

      <div className='my-8' />

      <div className='flex flex-col space-y-2'>
        {F.pipe(
          user,
          O.map(getPlaylistsFromUser),
          O.foldW(
            () => <></>,
            RA.map((playlist) => (
              <button onClick={() => setPreference({ _type: 'Playlist', playlist })}>
                {playlist.name}
              </button>
            ))
          )
        )}
      </div>

      <div className='my-8' />

      <div className='my-8' />

      <div>
        {F.pipe(
          swipedSongs,
          RA.map(({ id, name }) => (
            <div key={id}>
              {name}
            </div>
          ))
        )}
      </div>
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
        isPlaying={isPlaying}
        playSong={(song) => () => setCurrentSong(O.some(song))}
        resume={() => setIsPlaying(true)}
        pause={() => setIsPlaying(false)}
        toggle={() => setIsPlaying(!isPlaying)}
      />
    </>
  )
}

render(<AudioManager />, document.getElementById('root'))
