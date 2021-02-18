import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { getHashParams } from './utils'
import Mark from './components/icons/Mark'
import Cross from './components/icons/Cross'
import Footer from './components/Footer'
import { useSwipeable } from 'react-swipeable'
import { TaskEither } from 'fp-ts/TaskEither'
import { getRecommendations } from './spotifyapi'

const { 
  REACT_APP_CLIENT_ID,
  REACT_APP_REDIRECT_URI
} = process.env

export interface Api {
  getUser(): TaskEither<any, User>,
  getRecommendedSongs(): TaskEither<any, Song[]>
}

export type Song = {
  id: string,
  name: string,
  author: string,
  imgUrl: string,
  selected: boolean
}

export type User = {
  token: string,
  savedSongs: Song[]
}

const song: Song = {
  id: '9',
  name: 'Still Goin Down',
  author: 'Morgan Wallen',
  imgUrl: 'https://i.scdn.co/image/ab67616d00001e028186bf9413a587a7061b9755',
  selected: false
}

const Home = () => {
  const [user, setUser] = useState()

  const swipeBtns = useRef<HTMLDivElement>(null)

  const scopes = 'user-read-private, user-library-read'

  const getX = (str: string): number => {
    var n = str.indexOf("(");
    var n1 = str.indexOf(",");

    return parseInt(str.slice(n+1,n1-2));
  }

  const handlers = useSwipeable({
    onSwiped: (swipeData) => {
      const target = swipeData.event.currentTarget as HTMLElement

      target.style.transform = 'translate(0px, 0px) rotate(0deg)'
      if (swipeBtns.current) {
        swipeBtns.current.style.transform = 'translate(0px, 0px) rotate(0deg)'
      }
    },
    onSwiping: (swipeData) => {
      const target = swipeData.event.currentTarget as HTMLElement
      const { deltaX, deltaY } = swipeData
      
      const transX = getX(target.style.transform)

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
    document.body.classList.add('bg-purple', 'text-white', 'antialiased')

    const hashParams = getHashParams()

    if (hashParams.access_token) {
      const user: User = {
        token: hashParams.access_token,
        savedSongs: []
      }
      
      getRecommendations(user)()
        .then(tracks => {
          console.log(tracks)
        })
        .catch(err => console.error(err))
    }
    /* const userData = getUserData(access_token) */
    // try to get info

    /* if (hashParams.access_token) { */
    /*   getProfile(hashParams.access_token) */
    /*     .then(data => { */
    /*       setUser({ */
    /*         name: data.display_name */
    /*       }) */
    /*     }) */
    /*     .catch(err => console.error(err)) */

    /*   getSavedTracks(hashParams.access_token) */
    /*     .then(tracks => { */
    /*       console.log(tracks) */
    /*     }) */
    /*     .catch(err => { */
    /*       console.error(err) */
    /*     }) */
    /* } */
  }, [])

  const handleLogin = () => {
    let url = 'https://accounts.spotify.com/authorize'

    url += '?response_type=token';
    url += '&client_id=' + encodeURIComponent(REACT_APP_CLIENT_ID as string)
    url += '&scope=' + encodeURIComponent(scopes)
    url += '&redirect_uri=' + encodeURIComponent(REACT_APP_REDIRECT_URI as string)
    
    window.location.href = url
  }
  
  return (
    <div className='text-white'>
      <div className='min-h-screen'>
        <div className='p-8'>
          <div className='flex flex-col md:flex-row justify-between'>
            <div className='flex flex-col font-bold'>
              <h1 className='font-bold text-3xl text-gray-text mb-2'>Spotiswipe</h1>
              {!user && <p className='font-bold text-xl md:text-2xl text-gray-text'>Find amazing songs by swiping, just like Tinder.</p>}
            </div>
          </div>
          <div>
            {!user && 
            <button onClick={handleLogin} className='mt-5 rounded flex flex-row items-center bg-green-500 p-2'>
              <img src='/spotify.svg' width={16} height={16} className='mr-2' alt='Spotify logo' />
              <span className='font-bold text-purple'>Log-in with Spotify</span>
            </button>
            }
          </div>
        </div>

        {user && <div className='px-8 text-green-200'>
          <div className='bg-blue-500 w-full md:w-96 m-0 m-auto h-96 rounded-lg overflow-hidden' {...handlers}>
            test
          </div>
          <div ref={swipeBtns} className='mt-5 w-32 h-14 py-3 px-6 m-0 m-auto flex flex-row items-center justify-between rounded-full bg-white'>
            <div className='text-red-500 hover:bg-red-500 hover:text-white rounded p-2'>
                <Cross className='w-5 h-5 fill-current' />
              </div>
            <div className='text-green-500 hover:bg-green-500 hover:text-white rounded p-2'>
                <Mark className='w-5 h-5 fill-current' />
              </div>
            </div>
        </div>}

      </div>
      <Footer />
    </div>
  )
}

ReactDOM.render(<Home />, document.getElementById('root'))
