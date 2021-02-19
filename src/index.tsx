import React, { useEffect, useState, useRef } from 'react';
import { Transition } from '@headlessui/react'
import ReactDOM from 'react-dom';
import { isLeft } from 'fp-ts/Either'
import './index.css';
import { getHashParams } from './utils'
import Footer from './components/Footer'
import { useSwipeable } from 'react-swipeable'
import { ReactComponent as MusicIcon } from './music.svg'
import { ReactComponent as MarkIcon } from './check.svg'
import { ReactComponent as CrossIcon } from './cross.svg'
import { getSongs } from './spotifyapi'
import { dropLeft } from 'fp-ts/Array'

const { 
  REACT_APP_CLIENT_ID,
  REACT_APP_REDIRECT_URI
} = process.env

export type Song = {
  name: string
  previewUrl: string,
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
  const [error, setError] = useState<string>()

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

      target.style.transform = 'translate(0px, 0px) rotate(0deg)'
      if (swipeBtns.current) {
        swipeBtns.current.style.transform = 'translate(0px, 0px) rotate(0deg)'
      }
    },
    onSwiping: (swipeData) => {
      const target = swipeData.event.target as HTMLElement
      const { deltaX, deltaY } = swipeData
      
      const transX = target?.style?.transform ? getX(target.style.transform) : 0

      target.style.transform = `
        translate(${deltaX < 100 && deltaX > -100 ? deltaX / 5 | 0 : transX}px, ${deltaY < 0 ? deltaY / 2 : 0}px) 
        rotate(${deltaX / 10 | 0}deg)
      `
      if (swipeBtns.current) {
        swipeBtns.current.style.transform = `rotate(${deltaX / 15}deg)`
      }
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  })

  useEffect(() => {
    document.body.classList.add('bg-black', 'text-white', 'antialiased')

    const hashParams = getHashParams()

    if (hashParams.access_token) {
      const user: User = {
        token: hashParams.access_token,
        savedSongs: []
      }

      setLoggedIn(true)

      setSongs([
        {
          name: 'Little Rain',
          previewUrl: 'https://i.scdn.co/image/ab67616d00001e02d77ead842f06780393b7b779',
          imageUrl: 'https://i.scdn.co/image/ab67616d00001e02d77ead842f06780393b7b779'
        },
        {
          name: 'Hallelujah',
          previewUrl: 'https://i.scdn.co/image/ab67616d00001e02d77ead842f06780393b7b779',
          imageUrl: 'https://i.scdn.co/image/ab67616d00001e02d77ead842f06780393b7b779'
        },
        {
          name: 'Amen',
          previewUrl: 'https://i.scdn.co/image/ab67616d00001e02d77ead842f06780393b7b779',
          imageUrl: 'https://i.scdn.co/image/ab67616d00001e02d77ead842f06780393b7b779'
        }
      ])

      // getSongs(user)()
      // .then(data => {
      //   if (isLeft(data)) {
      //     setError(`Uh oh, there was an error! ${data.left}`)
      //   } else {
      //     setSongs(data.right)
      //   }
      // })
    }
  }, [])

  useEffect(() => {
    if (songs.length) {
      const audio = new Audio(songs[0].previewUrl)
      audio.play()
    }
  }, [songs])

  const swipe = (dir: SwipeDirection) => {
    if (dir === 'RIGHT' && songs.length) {
      setSavedSongs(s => s.concat(songs[0]))
    }

    setSongs(dropLeft(1))
  }
  
  const handleLogin = () => {
    let url = 'https://accounts.spotify.com/authorize'

    url += '?response_type=token';
    url += '&client_id=' + encodeURIComponent(REACT_APP_CLIENT_ID as string)
    url += '&scope=' + encodeURIComponent(scopes)
    url += '&redirect_uri=' + encodeURIComponent(REACT_APP_REDIRECT_URI as string)
    
    window.location.href = url
  }
  
  return (
    <div className='text-green-500'>
      <section className='min-h-screen p-8 md:py-8 md:px-24 flex flex-col'>
        <div className=''>
          <div className='flex flex-row justify-between align-baseline'>
            <div className='flex flex-col font-bold'>
              <h1 className='font-bold text-3xl mb-2'>Spotiswipe</h1>
              {!loggedIn && <p className='font-bold text-xl md:text-2xl text-gray-text'>Find amazing songs by swiping, just like Tinder.</p>}
            </div>
            <a href='#likedsongs-section'>
              <button className='bg-green-500 w-10 h-10 p-1 rounded-lg text-white'>
                <MusicIcon className='m-0 m-auto fill-current' width={16} height={16} />
              </button>
            </a>
          </div>
          <div>
            {!loggedIn && 
            <button onClick={handleLogin} className='mt-5 rounded flex flex-row items-center bg-green-500 p-2'>
              <img src='/spotify.svg' width={16} height={16} className='mr-2' alt='Spotify logo' />
              <span className='font-bold text-purple'>Log-in with Spotify</span>
            </button>
            }
          </div>
        </div>

        <div className='h-full py-8 flex-1'>
          {loggedIn && !!songs.length &&
          <div>
            <div 
            style={{ backgroundImage: `url(${songs[0].imageUrl})` }}
            className='cursor-grab bg-blue-500 bg-cover w-full md:w-96 h-96 m-0 m-auto rounded-lg overflow-hidden' 
            {...handlers}
            >
            </div>
            <div ref={swipeBtns} className='mt-5 w-32 h-14 py-3 px-6 m-0 m-auto flex flex-row items-center justify-between rounded-full bg-white'>
              <button onClick={() => swipe('LEFT')} className='text-red-500 hover:bg-red-500 hover:text-white rounded p-2'>
                <CrossIcon className='w-5 h-5 fill-current' />
              </button>
              <button onClick={() => swipe('RIGHT')} className='text-green-500 hover:bg-green-500 hover:text-white rounded p-2'>
                <MarkIcon className='w-5 h-5 fill-current' />
              </button>
            </div>
          </div>
          }
          {!songs.length && <p>Loading songs...</p>}
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
        <div className='p-8 md:py-8 md:px-24'>
          <h2 className='font-bold text-3xl'>Liked songs</h2>
          <ul>
            {savedSongs.map(s => (
              <li>{s.name}</li>
            ))}
          </ul>
        </div>
      </section>
      <Footer />
    </div>
  )
}

ReactDOM.render(<Home />, document.getElementById('root'))
