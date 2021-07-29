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
import { useUser } from './hooks/useUser'
import { useSongs } from './hooks/useSongs'
import { useSwipedSongs } from './hooks/useSwipedSongs'
import { useBackgroundColor } from './hooks/useBackgroundColor'
import { useSeeds } from './hooks/useSeeds'
import { ReactComponent as PersonIcon } from './assets/person.svg'
import { ADT, matchI } from 'ts-adt'
import { Card } from './components/Card'
import { SwipeButtons } from './components/SwipeButtons'
import { getRecommendedFromPlaylist, getRecommendedFromLikedSongs } from './api/spotify/spotifyapi'
import { handleLogin } from './api/spotify/login'
import { Playlist } from './domain/Playlist'
import { User, getTokenFromUser } from './domain/User'
import { Song } from './domain/Song'
import { render } from 'react-dom'
import './index.css'
import { useAudio } from './hooks/useAudio'

const ioVoid: IO.IO<void> = () => {}

export type SwipeDirection
  = 'LEFT'
  | 'RIGHT'

const Header = ({ user, handleLogin }: { user: O.Option<User>, handleLogin: IO.IO<void> }): JSX.Element => {
  return (
    <header className='flex justify-between opacity-90 items-center'>
      <div>
        <h1 className='font-bold text-3xl italic'>
          spotiswype
        </h1>
      </div>

      <div>
        {F.pipe(
          user,
          O.fold(
            () => <button onClick={handleLogin}>Log-in.</button>,
            (user) => (
              <div>
                <button className='bg-blur rounded-full p-2'>
                  <PersonIcon className='w-6 h-6 fill-current' />
                </button>
              </div>
            )
          )
        )}
      </div>
    </header>
  )
}

const Home = (): JSX.Element => {
  const user = useUser({ handleAPIError: () => {} })
  const [songs, { addSongs, removeLast, removeSong }] = useSongs()
  const [swipedSongs, { addSongToSwiped }] = useSwipedSongs()
  const [seeds] = useSeeds()
  const [preference] = useState<ADT<{
    Liked: {}
    Playlist: { playlist: Playlist }
  }>>({ _type: 'Liked' })
  const { color } = useBackgroundColor({ songs })
  const { isPlaying, playSong, toggle } = useAudio()

  const loadSongs = F.pipe(
    user,
    O.map(getTokenFromUser),
    TE.fromOption(F.constVoid),
    TE.chainW(matchI(preference)({
      Liked: () => getRecommendedFromLikedSongs,
      Playlist: ({ playlist }) => getRecommendedFromPlaylist(playlist)
    }))
  )

  const refresh = (): Promise<void> => loadSongs().then(E.fold(console.error, addSongs))

  const swipeLeft: IO.IO<void> = () => {
    removeLast()
  }

  const swipeRight = (song: Song): IO.IO<void> => () => {
    removeSong(song)
    addSongToSwiped(song)
  }

  useEffect(() => {
    F.pipe(songs, RA.head, O.fold(F.constant(ioVoid), playSong))()

    if (songs.length <= 0 && O.isSome(user)) {
      refresh()
    }
  }, [user, songs])

  useEffect(() => { refresh() }, [preference])

  return (
    <div className='p-4 h-full transition-colors' style={{ backgroundColor: color }}>
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
                preventSwipe={['up', 'down']}
              >
                <Card song={song} />
              </TinderCard>
            </div>
          ))
        )}

      </div>

        <SwipeButtons
          isPlaying={isPlaying}
          toggle={toggle}
          onSwipeLeft={swipeLeft}
          onSwipeRight={swipeRight(songs[0])}
        />
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

render(<Home />, document.getElementById('root'))
