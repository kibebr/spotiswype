/* eslint-disable @typescript-eslint/no-floating-promises */

import React, { FunctionComponent, useEffect, useState, useRef } from 'react'
import { render } from 'react-dom'
import { isLeft } from 'fp-ts/lib/Either'
import { SongCard } from './components/SongCard'
import { Deck } from './components/Deck'
import { SliderComponent } from './components/SliderComponent'
import { PlaylistBox } from './components/PlaylistBox'
import { LoadingIndicator } from './components/LoadingIndicator'
import { PlaylistBoxContainer } from './components/PlaylistBoxContainer'
import { ReactComponent as Sliders } from './assets/filter-circle.svg'
import { ReactComponent as MarkIcon } from './assets/check.svg'
import { ReactComponent as CrossIcon } from './assets/cross.svg'
import { ReactComponent as PlayIcon } from './assets/play-fill.svg'
import { ReactComponent as PauseIcon } from './assets/pause-fill.svg'
import { ReactComponent as SpotifyIcon } from './assets/spotify.svg'
import { getRecommendedFromPlaylist, getRecommendedFromLikedSongs } from './api/spotify/spotifyapi'
import { dropRight } from 'fp-ts/lib/Array'
import { handleLogin, handleFetchUser } from './api/spotify/login'
import { createSwipeable } from './swipehandler'
import { usePalette } from 'react-palette'
import { Playlist } from './domain/Playlist'
import { User } from './domain/User'
import { Song } from './domain/Song'
import './index.css'

interface SearchFilter {
  bpm: number
}

type Preference
  = { tag: 'LikedSongs', filter: SearchFilter }
  | { tag: 'Playlist', playlist: Playlist, filter: SearchFilter }

type Screen
  = 'Home'
  | 'Categories'

export type SwipeDirection
  = 'LEFT'
  | 'RIGHT'

const defaultFilter: SearchFilter = {
  bpm: 0
}

const defaultPreference: Preference = {
  tag: 'LikedSongs',
  filter: defaultFilter
}

const Home: FunctionComponent = () => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false)
  const [screen, setScreen] = useState<Screen>('Home')
  const [user, setUser] = useState<User | null>(null)
  const [songs, setSongs] = useState<Song[]>([])
  const [savedSongs, setSavedSongs] = useState<Song[]>([])
  const [songPlaying, setSongPlaying] = useState<boolean>(true)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)
  const [preference, setPreference] = useState<Preference>(defaultPreference)
  const [error, setError] = useState<string>('')

  const swipeBtns = useRef<HTMLDivElement>(null)

  const { data } = usePalette(songs[songs.length - 1]?.imageUrl)

  const refresh = async (user: User): Promise<void> => {
    if (preference.tag === 'LikedSongs') {
      getRecommendedFromLikedSongs(user)()
        .then(result => {
          if (!isLeft(result)) {
            setSongs(result.right)
          } else {
            console.error(result.left)
          }
        })
    } else if (preference.tag === 'Playlist') {
      getRecommendedFromPlaylist(preference.playlist)(user)()
        .then(result => {
          if (!isLeft(result)) {
            setSongs(result.right)
          } else {
            console.error(result.left)
          }
        })
    }
  }

  const swipe = (dir: SwipeDirection): void => {
    if (dir === 'RIGHT' && songs.length !== 0) {
      setSavedSongs(s => s.concat(songs[songs.length - 1]))
    }

    // songs[songs.length - 1].audio.pause()
    setSongs(dropRight(1))
  }

  const swipeHandler = createSwipeable(swipe, songs)

  useEffect((): void => {
    document.documentElement.style.setProperty('--vh', `${window.innerHeight / 100}px`)

    const run = async (): Promise<void> => {
      const response = await handleFetchUser()()

      if (!isLeft(response)) {
        setUser(response.right)
      }
    }

    run()
  }, [])

  useEffect((): void => {
    if (user !== null && songs.length === 0) {
      refresh(user)
    }
  }, [user, songs])

  useEffect(() => {
    if (audio !== null) {
      audio.pause()
    }

    if (songs.length >= 1) {
      const audio = new Audio(songs[songs.length - 1].audio)
      setAudio(audio)
    }
  }, [songs])

  useEffect((): void => {
    if (songPlaying && audio !== null) {
      audio.play()
        .catch(err => {
          setSongPlaying(false)
          console.error(err)
        })
    }
  }, [audio])

  useEffect((): void => {
    if (user !== null) {
      if (preference.tag === 'Playlist') {
        if (preference.playlist.songs.length === 0) {
          setError('This playlist seems empty!')
          return
        }
      }

      // songs[songs.length - 1]?.audio.pause()
      refresh(user)
      setSongs([])
    }
  }, [preference])

  const handleError = (err: Error): void => {
    console.error(err)
  }

  const toggleAudio = (song: Song): void => {
    if (audio !== null) {
      if (audio.paused) {
        audio.play()
          .catch(handleError)

        setSongPlaying(true)
      } else {
        audio.pause()
        setSongPlaying(false)
      }
    }
  }

  const selectPlaylist = (playlist: Playlist): void => {
    console.log(playlist.name)
    setMenuOpen(false)
  }

  return (
    <div className="font-bold transition-colors" style={{ backgroundColor: data?.lightVibrant as string }}>

      {menuOpen && (
        <div className='absolute z-50 w-full h-52 px-4 bg-white rounded-b-lg shadow-md py-3 inset-center-x max-w-screen-sm'>
          <button
            className='absolute p-1 text-white bg-red-500 rounded-full w-7 h-7 top-7 md:top-8 right-2'
            onClick={(): void => setMenuOpen(false)}
          >
            <CrossIcon className='absolute fill-current inset-center' width={16} height={16} />
          </button>
          <div>
            <h2 className='mb-3 text-xl text-black'>Filter by</h2>
          </div>
        </div>
      )}

      <section className="relative flex flex-col px-4 py-3 m-0 m-auto min-vh max-w-screen-sm">
        <div className="relative flex flex-row items-center justify-between">
          <a href="http://192.168.0.16:3000">
            <h1 className="mb-2 text-3xl font-bold text-black md:text-3xl hover:text-white transition-colors">
              Spotiswype
            </h1>
          </a>
          <button onClick={(): void => setMenuOpen(true)} className='relative w-10 h-10 bg-blur text-black rounded-full'>
            <Sliders className='w-5 h-5 fill-current absolute inset-center' />
          </button>
        </div>
        {user === null && (
          <div className="flex flex-col">
              <p className="text-xl font-bold text-gray-400 md:text-1xl">
                Find songs you'll enjoy by swiping.
              </p>

              <button
                onClick={handleLogin}
                className="flex flex-row items-center justify-center p-2 mt-5 bg-green-400 rounded w-44"
              >
                <SpotifyIcon className="mr-2" width="16px" height="16px" />
                <span className="font-bold text-black">
                  Log-in with Spotify
                </span>
              </button>
          </div>
        )}

      <div className="flex justify-center h-full">
        {songs.length !== 0 && (
          <div>
            <div className='flex justify-center' {...swipeHandler}>
              <Deck songs={songs} />
            </div>
            <div
              ref={swipeBtns}
              className="absolute bottom-12 z-50 flex flex-row items-center justify-between px-5 py-3 mb-5 bg-white rounded-full w-36 inset-center-x h-14"
            >
            <button
                onClick={(): void => swipe('LEFT')}
                className="p-2 text-red-500 rounded transition-all hover:bg-red-500 hover:text-white"
              >
                <CrossIcon className="fill-current" width='16px' height='16px' />
            </button>
            <button onClick={(): void => toggleAudio(songs[songs.length - 1])} className='p-1 rounded transition-all text-purple-strong hover:bg-purple-strong hover:text-white'>
              {songPlaying ? <PauseIcon width='24px' height='24px' /> : <PlayIcon width='24px' height='24px' />}
            </button>
            <button
                onClick={(): void => swipe('RIGHT')}
                className="p-2 text-green-500 rounded transition-all hover:bg-green-500 hover:text-white"
              >
              <MarkIcon className="fill-current" width='16px' height='16px' />
            </button>
          </div>
        </div>
        )}

      {songs.length === 0 && user !== null && (
        <div className='absolute inset-center'>
          <LoadingIndicator />
        </div>
      )}
        </div>
      </section>

      {user !== null && (
        <>
          <section>
            <div className='max-w-screen-sm px-4 m-0 m-auto'>
              <h2 className='mb-5 text-2xl text-black'>Recommend by</h2>
              <ul className='grid gap-2 grid-cols-3 grid-rows-3 items-center'>
                {user.playlists.map((playlist) => (
                  <PlaylistBox playlist={playlist} onClick={(): void => setPreference(p => ({ ...p, tag: 'Playlist', playlist }))} />
                ))}
              </ul>
            </div>
          </section>
          <section>
            <div className='px-4 m-0 m-auto py-7 md:py-8 max-w-screen-sm'>
              <h2 className='mb-5 text-2xl text-black'>Liked songs</h2>
              <ul>
                {savedSongs.map(savedSong => (
                  <SongCard song={savedSong} />
                ))}
              </ul>
            </div>
          </section>
        </>
      )}
    </div>
  )
}

render(<Home />, document.getElementById('root'))

// TODO: let user decide if swiped-right songs will be added to a certain playlist automatically
