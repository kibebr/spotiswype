import React, { useEffect, useState, useRef } from 'react'
import { Transition } from '@headlessui/react'
import { render } from 'react-dom'
import { isLeft } from 'fp-ts/Either'
import './index.css'
import { getHashParams } from './utils/HashParams'
import Footer from './components/Footer'
import { SongCard } from './components/SongCard'
import { useSwipeable } from 'react-swipeable'
import { ReactComponent as StarIcon } from './assets/two-vertical-dots.svg'
import { ReactComponent as MarkIcon } from './assets/check.svg'
import { ReactComponent as CrossIcon } from './assets/cross.svg'
import { ReactComponent as PlayIcon } from './assets/play-fill.svg'
import { ReactComponent as PauseIcon } from './assets/pause-fill.svg'
import { ReactComponent as SpotifyIcon } from './assets/spotify.svg'
import { getSongs } from './api/spotifyapi'
import { dropRight } from 'fp-ts/Array'

const {
  REACT_APP_CLIENT_ID,
  REACT_APP_REDIRECT_URI
} = process.env

export interface Song {
  name: string
  audio: HTMLAudioElement
  imageUrl: string
}

export type Preferences = {
  bpm: string
}

type SwipeDirection
  = 'LEFT'
  | 'RIGHT'

export default function Home (): JSX.Element {
  const [menuOpen, setMenuOpen] = useState<boolean>(false)
  const [token, setToken] = useState<string | null>(null)
  const [songs, setSongs] = useState<Song[]>([])
  const [savedSongs, setSavedSongs] = useState<Song[]>([])
  const [songPlaying, setSongPlaying] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  const swipeBtns = useRef<HTMLDivElement>(null)

  const scopes = 'user-read-private, user-library-read'

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
        swipe('RIGHT')
      }

      if (swipeBtns.current !== null) {
        swipeBtns.current.style.transform = 'rotate(0deg)'
      }
    },
    onSwiping: (swipeData) => {
      const target = swipeData.event.target as HTMLElement

      if (!target.classList.contains('card')) {
        return
      }

      target.classList.add('no-transition')

      const { deltaX, deltaY } = swipeData
      const xMulti = deltaX * 0.03
      const yMulti = deltaY / 80
      const rotate = xMulti * yMulti

      target.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(${rotate}deg)`

      if (swipeBtns.current !== null) {
        swipeBtns.current.style.transform = `rotate(${rotate}deg)`
      }
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  })

  const refresh = (token: string): void => {
    getSongs(token)()
      .then(result => {
        if (!isLeft(result)) {
          setSongs(s => result.right.concat(s))
        }
      })
      .catch(handleError)
  }

  useEffect((): void => {
    document.documentElement.style.setProperty('--vh', `${window.innerHeight / 100}px`)
    const hashParams = getHashParams()

    if ((hashParams.access_token ?? '') !== '') {
      setToken(hashParams.access_token)
    }
  }, [])

  useEffect((): void => {
    if (songs.length === 0 && token !== null) {
      refresh(token)
    }
  }, [songs, token])

  const swipe = (dir: SwipeDirection): void => {
    if (dir === 'RIGHT' && songs.length !== 0) {
      setSavedSongs(s => s.concat(songs[songs.length - 1]))
    }

    setSongs(dropRight(1))
  }

  const handleLogin = (): void => {
    let url = 'https://accounts.spotify.com/authorize'

    url += '?response_type=token'
    url += '&client_id=' + encodeURIComponent(REACT_APP_CLIENT_ID as string)
    url += '&scope=' + encodeURIComponent(scopes)
    url += '&redirect_uri=' + encodeURIComponent(REACT_APP_REDIRECT_URI as string)

    window.location.href = url
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

  return (
    <div className='font-bold text-green-400'>
      <svg width='10' height='10' viewBox='0 0 10 10'>
        <clipPath id='squircleClip' clipPathUnits='objectBoundingBox'>
          <path
            fill='red'
            stroke='none'
            d='M 0,0.5 C 0,0 0,0 0.5,0 S 1,0 1,0.5 1,1 0.5,1 0,1 0,0.5'
          />
        </clipPath>
      </svg>
      <section className='z-50 flex flex-col px-4 m-0 m-auto min-vh py-7 md:py-8 max-w-screen-sm'>
        <Transition show={menuOpen} enter='transition-all duration-1000' enterFrom='max-h-0'>
          <div className='absolute top-0 z-50 w-full max-h-screen bg-white hinset-center-x max-w-screen-sm'>
            menu!
          </div>
        </Transition>
        <div>
          <div className='flex flex-row items-center justify-between align-baseline'>
            <a href='http://192.168.0.16:3000'>
              <h1 className='mb-2 font-bold text-1xl fr md:text-3xl rounded-2xl hover:text-white transition-colors'>
                spotiswype
              </h1>
            </a>
            <button onClick={() => setMenuOpen(s => !s)} className='relative hover:text-white fr'>
              <StarIcon className='absolute fill-current transition-colors inset-center' width={24} height={24} />
            </button>
          </div>
          <div className='flex flex-col justify-between align-baseline'>
            {token === null && <p className='text-xl font-bold text-gray-400 md:text-1xl'>Find songs you'll enjoy by swiping.</p>}
          </div>
          <div>
            {token === null &&
            <button onClick={handleLogin} className='flex flex-row items-center p-2 mt-5 bg-green-400 rounded'>
              <SpotifyIcon className='mr-2' width='16px' height='16px' />
              <span className='font-bold text-black'>Log-in with Spotify</span>
          </button>}
        </div>
      </div>

      <div className='relative flex-1 h-full'>
        {token !== null && songs.length !== 0 &&
        <div className='flex justify-center w-full text-center transform -translate-y-5' {...handlers}>
          {songs.map((song, i) => (
            <div
              className={`p-5 card transition-transform absolute bg-cover bg-center cursor-grab test w-11/12 md:w-6/12 bg-red-500 rounded-3xl ${''}`}
              style={{
                transform: `scale(${(20 - (songs.length - i)) / 20}) translateY(${30 * (songs.length - i)}px)`,
                  backgroundImage: `url(${song.imageUrl})`
              }}
            >
              <span className='font-bold'>{song.name} by Morgan Wallen</span>
              <button onClick={() => toggleAudio(songs[i])} className='absolute w-16 h-16 p-1 text-black rounded-full bg-blur inset-center'>
                {!songPlaying && <PlayIcon className='absolute inset-center' width={32} height={32} />}
            {songPlaying && <PauseIcon className='absolute inset-center' width={32} height={32} />}
          </button>
        </div>
    ))}

    <div ref={swipeBtns} className='absolute top-0 z-50 flex flex-row items-center justify-between w-32 px-5 py-3 m-0 m-auto bg-white rounded-full h-14'>
      <button onClick={() => swipe('LEFT')} className='p-2 text-red-500 rounded transition-all hover:bg-red-500 hover:text-white'>
        <CrossIcon className='w-5 h-5 fill-current' />
      </button>
      <button onClick={() => swipe('RIGHT')} className='p-2 text-green-500 rounded transition-all hover:bg-green-500 hover:text-white'>
        <MarkIcon className='w-5 h-5 fill-current' />
      </button>
    </div>
</div>}
{songs.length === 0 && token !== null && <p>Loading songs...</p>}
        </div>

        <Transition show={Boolean(error)} enter='transition-opacity duration-500' enterFrom='opacity-0'>
          <div className='absolute flex items-center justify-center top-8 md:right-8'>
            <div className='flex items-center justify-start w-9/12 p-4 font-bold text-red-800 bg-red-300 rounded-lg h-14'>
              {error}
            </div>
          </div>
        </Transition>
      </section>

      <section id='likedsongs-section' className='hidden w-full min-h-full bg-white fr transition-all'>
        <div className='p-4 m-0 m-auto md:py-8 max-w-screen-sm'>
          <h2 className='mb-5 text-3xl font-bold'>Liked songs</h2>
          <ul>
            {savedSongs.map(s => (
              <SongCard name={s.name} author='Morgan Wallen' imageUrl={s.imageUrl} />
            ))}
          </ul>
    {savedSongs.length === 0 && <p>Songs you swiped right will appear here.</p>}
  </div>
</section>
    </div>
  )
}

render(<Home />, document.getElementById('root'))
