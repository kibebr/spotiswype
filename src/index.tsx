import React, { useEffect, useState, useRef } from 'react'
import { Transition } from '@headlessui/react'
import { render } from 'react-dom'
import { isLeft } from 'fp-ts/Either'
import './index.css'
import { getHashParams } from './utils'
import Footer from './components/Footer'
import { useSwipeable } from 'react-swipeable'
import StarIcon from './assets/music-note-list.svg'
import MarkIcon from './assets/check.svg'
import CrossIcon from './assets/cross.svg'
import PlayIcon from './assets/play-fill.svg'
import PauseIcon from './assets/pause-fill.svg'
import SpotifyIcon from './assets/spotify.svg'
import { getSongs } from './api/spotifyapi'
import { dropRight, reverse } from 'fp-ts/Array'

const {
  REACT_APP_CLIENT_ID,
  REACT_APP_REDIRECT_URI
} = process.env

export type Song = {
  name: string
  audio: HTMLAudioElement
  imageUrl: string
}

type SwipeDirection
  = 'LEFT'
  | 'RIGHT'

export default function Home (): JSX.Element {
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

        target.style.transform = `translate(${toX}px, ${toY + deltaY}px) rotate(${rotate}deg)`
        setSongs(dropRight(1))
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

  const refresh = (): void => {
    setSongs(s => [
      {
        name: 'Little Rain',
        audio: new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'),
        imageUrl: 'https://imagesvc.meredithcorp.io/v3/mm/image?q=85&c=sc&poi=face&w=2000&h=2000&url=https%3A%2F%2Fstatic.onecms.io%2Fwp-content%2Fuploads%2Fsites%2F20%2F2019%2F10%2Ftaylor-swift-albums-1.jpg'
      },
      {
        name: 'Hallelujah',
        audio: new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'),
        imageUrl: 'https://i.scdn.co/image/ab67616d00001e02d77ead842f06780393b7b779'
      },
      {
        name: 'Amen',
        audio: new Audio('https://i.scdn.co/image/ab67616d00001e02d77ead842f06780393b7b779'),
        imageUrl: 'https://i.scdn.co/image/ab67616d00001e02d77ead842f06780393b7b779'
      }
    ].concat(s))
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
      refresh()
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
    <div className='text-green-400 font-bold'>
      <svg width="10" height="10" viewBox="0 0 10 10">
  <clipPath id="squircleClip" clipPathUnits="objectBoundingBox">
    <path
      fill="red"
      stroke="none"
      d="M 0,0.5 C 0,0 0,0 0.5,0 S 1,0 1,0.5 1,1 0.5,1 0,1 0,0.5"
    />
  </clipPath>
</svg>
      <section className='z-50 min-h-screen p-4 md:py-8 md:px-56 flex flex-col'>
        <div>
          <div className='flex flex-row justify-between align-baseline'>
            <div className='flex flex-col font-bold'>
              <a href='http://192.168.0.16:3000'>
                <h1 className='font-bold text-3xl md:text-3xl mb-2'>Spotiswype</h1>
              </a>
              {token === null && <p className='font-bold text-xl md:text-1xl text-gray-400'>Find songs you'll enjoy by swiping.</p>}
            </div>
            <a href='#likedsongs-section'>
              <div className='relative'>
                <div className='absolute hidden transform -translate-x-3 squircle w-8 h-8 p-1 bg-green-400 text-white'>
                </div>
                <button className='relative squircle bg-green-400 w-10 h-10 p-1 text-white'>
                  <StarIcon className='absolute inset-center fill-current' width={16} height={16} />
                </button>
              </div>
            </a>
          </div>
          <div>
            {token === null &&
            <button onClick={handleLogin} className='mt-5 rounded flex flex-row items-center bg-green-400 p-2'>
              <SpotifyIcon className='mr-2' width='16px' height='16px' />
              <span className='font-bold text-black'>Log-in with Spotify</span>
            </button>
            }
          </div>
        </div>

        <div className='h-full relative py-7 flex-1'>
          {token !== null && songs.length !== 0 &&
          <div className='text-center flex justify-center w-full' {...handlers}>
            {songs.map((song, i) => (
              <div
                className={`card top-0 transition-transform absolute bg-cover cursor-grab test w-full md:w-96 bg-red-500 rounded-md ${''}`}
                style={{
                  transform: `scale(${(20 - (songs.length - i)) / 20}) translateY(${30 * (songs.length - i)}px)`,
                  backgroundColor: `blue`
                }}
              >
                {song.name}
                <button onClick={() => toggleAudio(songs[i])} className='text-black absolute bg-blur inset-center w-16 h-16 p-1 rounded-full'>
                  {!songPlaying && <PlayIcon className='absolute inset-center' width='32px' height='32px' />}
                  {songPlaying && <PauseIcon className='absolute inset-center' width='32px' height='32px' />}
                </button>
              </div>
            ))}

            <div ref={swipeBtns} className='absolute z-50 bottom-20 w-32 h-14 py-3 px-5 m-0 m-auto flex flex-row items-center justify-between rounded-full bg-blur'>
              <button onClick={() => swipe('LEFT')} className='transition-all text-red-500 hover:bg-red-500 hover:text-white rounded p-2'>
                <CrossIcon className='w-5 h-5 fill-current' />
              </button>
              <button onClick={() => swipe('RIGHT')} className='transition-all text-green-500 hover:bg-green-500 hover:text-white rounded p-2'>
                <MarkIcon className='w-5 h-5 fill-current' />
              </button>
            </div>
          </div>
          }
          {songs.length === 0 && token !== null && <p>Loading songs...</p>}
        </div>

        <Transition show={Boolean(error)} enter='transition-opacity duration-500' enterFrom='opacity-0'>
          <div className='absolute top-8 md:right-8 flex items-center justify-center'>
            <div className='bg-red-300 w-9/12 h-14 flex justify-start items-center rounded-lg p-4 text-red-800 font-bold'>
              {error}
            </div>
          </div>
        </Transition>
      </section>

      <section id='likedsongs-section' className='bg-black w-full h-96'>
        <div className='p-8 md:py-8 md:px-56'>
          <h2 className='font-bold text-3xl'>Liked songs</h2>
          <ul>
            {savedSongs.map(s => (
              <li>{s.name}</li>
            ))}
          </ul>
          {savedSongs.length === 0 && <p>Songs you swiped right will appear here.</p>}
        </div>
      </section>
      <Footer />
    </div>
  )
}

render(<Home />, document.getElementById('root'))
