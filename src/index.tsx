/* eslint-disable @typescript-eslint/no-floating-promises */

import React, { FunctionComponent, useEffect, useState, useRef } from 'react'
import { render } from 'react-dom'
import { isLeft } from 'fp-ts/lib/Either'
import { SongCard } from './components/SongCard'
import { Deck } from './components/Deck'
import { SliderComponent } from './components/SliderComponent'
import { PlaylistBox } from './components/PlaylistBox'
import { PlaylistBoxContainer } from './components/PlaylistBoxContainer'
import { useSwipeable } from 'react-swipeable'
import { ReactComponent as StarIcon } from './assets/two-vertical-dots.svg'
import { ReactComponent as MarkIcon } from './assets/check.svg'
import { ReactComponent as CrossIcon } from './assets/cross.svg'
import { ReactComponent as PlayIcon } from './assets/play-fill.svg'
import { ReactComponent as PauseIcon } from './assets/pause-fill.svg'
import { ReactComponent as SpotifyIcon } from './assets/spotify.svg'
import { getRecommendedFromPlaylist } from './api/spotify/spotifyapi'
import { dropRight } from 'fp-ts/lib/Array'
import { handleLogin, handleFetchUser } from './api/spotify/login'
import './index.css'

export interface Author {
  id: string
  name: string
}

export interface Song {
  id: string
  name: string
  author: Author
  audio: HTMLAudioElement
  imageUrl: string
  link: string
}

export interface Playlist {
  id: string
  name: string
  imageUrl?: string
  songs: Song[]
}

export interface User {
  token: string
  id: string
  name: string
  playlists: Playlist[]
}

interface SearchFilter {
  bpm: number
}

type Preference
  = { tag: 'LikedSongs', filter: SearchFilter }
  | { tag: 'Playlist', playlist: Playlist, filter: SearchFilter }

type SwipeDirection
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
  const [user, setUser] = useState<User | null>(null)
  const [songs, setSongs] = useState<Song[]>([])
  const [savedSongs, setSavedSongs] = useState<Song[]>([])
  const [songPlaying, setSongPlaying] = useState<boolean>(false)
  const [preference, setPreference] = useState<Preference>(defaultPreference)
  const [error, setError] = useState<string>('')

  const swipeBtns = useRef<HTMLDivElement>(null)

  const handlers = useSwipeable({
    onSwiped: (swipeData) => {
      const target = swipeData.event.target as HTMLElement
      const { absX, deltaX, deltaY, vxvy } = swipeData
      const moveOutWidth = document.body.clientWidth
      const shouldKeep = absX < 80 || Math.abs(vxvy[0]) < 0.5

      if (shouldKeep) {
        target.style.transform = ''
      } else {
        const endX = Math.max(Math.abs(vxvy[0]) * moveOutWidth, moveOutWidth)
        const toX = deltaX > 0 ? endX : -endX
        const endY = Math.abs(vxvy[1]) * moveOutWidth
        const toY = deltaY > 0 ? endY : -endY

        const xMulti = deltaX * 0.03
        const yMulti = deltaY / 80
        const rotate = xMulti * yMulti

        target.style.transform = `translate(${toX}px, ${toY - deltaY}px) rotate(${rotate}deg)`
        swipe(toX > 0 ? 'RIGHT' : 'LEFT')
      }
    },
    onSwiping: (swipeData) => {
      const target = swipeData.event.target as HTMLElement

      if (!target.classList.contains('card') || Number(target.id) !== songs.length - 1) {
        return
      }

      target.classList.add('no-transition')

      const { deltaX, deltaY } = swipeData
      const xMulti = deltaX * 0.03
      const yMulti = deltaY / 80
      const rotate = xMulti * yMulti

      target.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(${rotate}deg)`
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  })

  const refresh = async (user: User): Promise<void> => {
    if (preference.tag === 'LikedSongs') {
      console.error('Cannot find by liked songs for now.')
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

  useEffect((): void => {
    if (songPlaying && songs.length >= 1) {
      songs[songs.length - 1].audio.play()
        .catch(err => {
          setSongPlaying(false)
          console.error(err)
        })
    }
  }, [songs])

  useEffect((): void => {
    if (user !== null) {
      if (preference.tag === 'Playlist') {
        if (preference.playlist.songs.length === 0) {
          setError('This playlist seems empty!')
          return
        }
      }

      refresh(user)
      setSongs([])
    }
  }, [preference])

  const swipe = (dir: SwipeDirection): void => {
    if (dir === 'RIGHT' && songs.length !== 0) {
      setSavedSongs(s => s.concat(songs[songs.length - 1]))
    }

    songs[songs.length - 1].audio.pause()
    setSongs(dropRight(1))
  }

  const handleError = (err: Error): void => {
    console.error(err)
  }

  const toggleAudio = (song: Song): void => {
    if (song.audio.paused) {
      song.audio.play()
        .catch(handleError)

      setSongPlaying(true)
    } else {
      song.audio.pause()
      setSongPlaying(false)
    }
  }

  const selectPlaylist = (playlist: Playlist): void => {
    console.log(playlist.name)
    setMenuOpen(false)
  }

  return (
    <div className="font-bold text-green-400">

      {menuOpen && (
        <div className='absolute z-50 w-full h-64 px-4 bg-white rounded-b-lg shadow-md py-7 md:py-8 inset-center-x max-w-screen-sm'>
          <button
            className='absolute p-1 text-white bg-red-500 rounded-full w-7 h-7 top-7 md:top-8 right-2'
            onClick={(): void => setMenuOpen(false)}
          >
            <CrossIcon className='absolute fill-current inset-center' width={16} height={16} />
          </button>
          <div>
            <h2 className='mb-3 text-purple-strong'>Recommend by playlist</h2>
            <SliderComponent>
              {user?.playlists.map(playlist => (
                <PlaylistBoxContainer playlistName={playlist.name}>
                  <PlaylistBox playlist={playlist} onClick={(): void => setPreference(p => ({ ...p, tag: 'Playlist', playlist }))}/>
                </PlaylistBoxContainer>
              ))}
            </SliderComponent>
          </div>
        </div>
      )}

      <section className="relative flex flex-col px-4 m-0 m-auto min-vh py-7 md:py-8 max-w-screen-sm">
        <div className="relative flex flex-row items-center justify-between align-start">
          <a href="http://192.168.0.16:3000">
            <h1 className="mb-2 text-3xl font-bold text-white md:text-3xl hover:text-white transition-colors">
              spotiswype
            </h1>
          </a>
          {user !== null && (
            <button
              onClick={(): void => setMenuOpen(true)}
              className="relative w-5 h-7 hover:text-white text-purple-strong"
            >
              <StarIcon
                className="absolute top-0 fill-current transition-colors inset-center-x"
                width={24}
                height={24}
              />
            </button>
          )}
        </div>
        {user === null && (
          <div className="flex flex-col">
              <p className="text-xl font-bold text-gray-400 md:text-1xl">
                Find songs you'll enjoy by swiping.
              </p>

              <button
                onClick={handleLogin}
                className="flex flex-row items-center p-2 mt-5 bg-green-400 rounded"
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
            <div className='flex justify-center' {...handlers}>
              <Deck songs={songs} />
            </div>
            <div
              ref={swipeBtns}
              className="absolute bottom-0 z-50 flex flex-row items-center justify-between px-5 py-3 mb-5 bg-white rounded-full w-36 inset-center-x h-14"
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
        <p>Just a second {user.name}, we are looking for songs you might like...</p>
      )}
        </div>
      </section>

      {user !== null && (
        <section>
          <div className='px-4 m-0 m-auto py-7 md:py-8 max-w-screen-sm'>
            <h2 className='mb-5 text-2xl text-white'>Liked songs</h2>
            <ul>
              {savedSongs.map(savedSong => (
                <SongCard song={savedSong} />
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  )
}

render(<Home />, document.getElementById('root'))

// TODO: let user decide if swiped-right songs will be added to a certain playlist automatically
