import React, { useEffect, useState, useRef } from 'react';
import { Transition } from '@headlessui/react'
import ReactDOM from 'react-dom';
import { isLeft } from 'fp-ts/Either'
import './index.css';
import { getHashParams } from './utils'
import Footer from './components/Footer'
import { useSwipeable } from 'react-swipeable'
import { ReactComponent as StarIcon } from './assets/star-fill.svg'
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

export type Song = {
  name: string
  audio: HTMLAudioElement,
  imageUrl: string
}

export type User = {
  token: string,
  savedSongs: Song[]
}

type SwipeDirection
  = 'LEFT'
  | 'RIGHT'

const Home = () => {
  const [loggedIn, setLoggedIn] = useState<boolean>(false)
  const [songs, setSongs] = useState<Song[]>([])
  const [savedSongs, setSavedSongs] = useState<Song[]>([])
  const [songPlaying, setSongPlaying] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  const swipeBtns = useRef<HTMLDivElement>(null)

  const scopes = 'user-read-private, user-library-read'

  const getX = (str: string): number => {
    var n = str.indexOf("(");
    var n1 = str.indexOf(",");

    return parseInt(str.slice(n+1,n1-2));
  }

  const handlers = useSwipeable({
    onSwiped: (swipeData) => {
      const target = swipeData.event.target as HTMLElement
      const { absX, deltaX, deltaY, velocity, vxvy } = swipeData

      const moveOutWidth = document.body.clientWidth
      const shouldKeep = absX < 80 || Math.abs(vxvy[0]) < 0.5

      if (shouldKeep) {
        console.log('keep!')
        target.style.transform = ''
      } else {
        const endX = Math.max(Math.abs(vxvy[0]) * moveOutWidth, moveOutWidth);
        const toX = deltaX > 0 ? endX : -endX
        const endY = Math.abs(vxvy[1]) * moveOutWidth
        const toY = deltaY > 0 ? endY : -endY
        
        const xMulti = deltaX * 0.03
        const yMulti = deltaY / 80
        const rotate = xMulti * yMulti

        target.style.transform = `translate(${toX}px, ${toY + deltaY}px) rotate(${rotate}deg)`
      }

      if (swipeBtns.current) {
        swipeBtns.current.style.transform = 'rotate(0deg)'
      }
    },
    onSwiping: (swipeData) => {
      const target = swipeData.event.target as HTMLElement

      if (!target.classList.contains('card')) {
        return
      }


      const { deltaX, deltaY } = swipeData
      const xMulti = deltaX * 0.03
      const yMulti = deltaY / 80
      const rotate = xMulti * yMulti

      target.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(${rotate}deg)`

      if (swipeBtns.current) {
        swipeBtns.current.style.transform = `rotate(${rotate}deg)`
      }
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  })

  const refresh = () => {
    setSongs([
      {
        name: 'Little Rain',
        audio: new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'),
        imageUrl: 'https://i.scdn.co/image/ab67616d00001e02d77ead842f06780393b7b779'
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
    ])
  }

  useEffect(() => {
    if (!loggedIn) {
      return
    } else {
      refresh()
    }
  }, [loggedIn])

  useEffect(() => {
    const hashParams = getHashParams()

    if (hashParams.access_token) {
      const user: User = {
        token: hashParams.access_token,
        savedSongs: []
      }

      getSongs(user)()
        .then(data => {
          if (isLeft(data)) {

          } else {
            setSongs(data.right)
          }
        })
      setLoggedIn(true)
    }
  }, [])

  const swipe = (dir: SwipeDirection) => {
    if (dir === 'RIGHT' && songs.length) {
      setSavedSongs(s => s.concat(songs[0]))
    }

    setSongs(dropRight(1))
  }
  
  const handleLogin = () => {
    let url = 'https://accounts.spotify.com/authorize'

    url += '?response_type=token';
    url += '&client_id=' + encodeURIComponent(REACT_APP_CLIENT_ID as string)
    url += '&scope=' + encodeURIComponent(scopes)
    url += '&redirect_uri=' + encodeURIComponent(REACT_APP_REDIRECT_URI as string)
    
    window.location.href = url
  }

  const toggleAudio = (song: Song) => {
    if (song.audio.paused) {
      song.audio.play()
      setSongPlaying(true)
    } else {
      song.audio.pause()
      setSongPlaying(false)
    }
  }
  
  return (
    <div className='text-blue-500'>
      <section className='min-h-screen p-8 md:py-8 md:px-36 flex flex-col'>
        <div className=''>
          <div className='flex flex-row justify-between align-baseline'>
            <div className='flex flex-col font-bold'>
              <a href='http://192.168.0.16:3000'>
                <h1 className='font-bold text-3xl md:text-5xl mb-2'>Spotiswype</h1>
              </a>
              {!loggedIn && <p className='font-bold text-xl md:text-2xl text-gray-text'>Find songs you'll enjoy by swiping.</p>}
            </div>
            <a href='#likedsongs-section'>
              <button className='bg-blue-500 w-10 h-10 p-1 rounded-full text-white'>
                <StarIcon className='m-0 m-auto fill-current' width={16} height={16} />
              </button>
            </a>
          </div>
          <div>
            {!loggedIn && 
            <button onClick={handleLogin} className='mt-5 rounded flex flex-row items-center bg-blue-500 p-2'>
              <SpotifyIcon className='mr-2' width='16px' height='16px' />
              <span className='font-bold text-white'>Log-in with Spotify</span>
            </button>
            }
          </div>
        </div>

        <div className='h-full relative py-8 flex-1'>
          {loggedIn && !!songs.length &&
          <div className='text-center flex justify-center' {...handlers}>
            {songs.map((song, i) => (
              <div 
                className={`card transition-transform absolute bg-cover cursor-grab test w-full md:w-96 bg-red-500 rounded-md ${''}`}
                style={{
                  transform: `scale(${(20 - (songs.length - i)) / 20}) translateY(${30 * (songs.length - i)}px)`,
                  opacity: `${10 - ((songs.length - i) * 3)}`,
                  zIndex: i,
                  backgroundImage: `url(${song.imageUrl})`,
                }}
              >
                <button onClick={() => toggleAudio(songs[i])} className='text-white bottom-0 w-full h-24 p-1 rounded-b-md'>
                  {!songPlaying && <PlayIcon className='absolute inset-center' width='32px' height='32px' />}
                  {songPlaying && <PauseIcon className='absolute inset-center' width='32px' height='32px' />}
                </button>
              </div>
            ))}

            <div ref={swipeBtns} className='absolute z-50 bottom-0 shadow-md mt-5 w-32 h-14 py-3 px-6 m-0 m-auto flex flex-row items-center justify-between rounded-full bg-white'>
              <button onClick={() => swipe('LEFT')} className='transition-all text-red-500 hover:bg-red-500 hover:text-white rounded p-2'>
                <CrossIcon className='w-5 h-5 fill-current' />
              </button>
              <button onClick={() => swipe('RIGHT')} className='transition-all text-green-500 hover:bg-green-500 hover:text-white rounded p-2'>
                <MarkIcon className='w-5 h-5 fill-current' />
              </button>
            </div>
          </div>
          }
          {!songs.length && loggedIn && <p>Loading songs...</p>}
        </div>
       
        <Transition show={Boolean(error)} enter='transition-opacity duration-500' enterFrom='opacity-0'>
          <div className='absolute top-8 md:right-8 flex items-center justify-center'>
            <div className='bg-red-300 w-9/12 h-14 flex justify-start items-center rounded-lg p-4 text-red-800 font-bold'>
              {error}
            </div>
          </div>
        </Transition>
      </section>

      <section id='likedsongs-section' className='bg-red-200 w-full h-96'>
        <div className='p-8 md:py-8 md:px-36'>
          <h2 className='font-bold text-3xl'>Liked songs</h2>
          <ul>
            {savedSongs.map(s => (
              <li>{s.name}</li>
            ))}
          </ul>
          {!savedSongs.length && <p>You still have no liked songs.</p>}
        </div>
      </section>
      <Footer />
    </div>
  )
}

ReactDOM.render(<Home />, document.getElementById('root'))
