import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { getHashParams } from './utils.js'
import Mark from './components/icons/Mark.js'
import Cross from './components/icons/Cross.js'
import { useSwipeable } from 'react-swipeable'

const { 
  REACT_APP_CLIENT_ID,
  REACT_APP_REDIRECT_URI
} = process.env

const getProfile = (accessToken) => new Promise((resolve, reject) => {
  const request = new XMLHttpRequest()
  request.open('GET', 'https://api.spotify.com/v1/me')
  request.setRequestHeader('Authorization', `Bearer ${accessToken}`)

  request.onload = () => {
    if (request.status >= 400 && request.status <= 500) {
      reject(Error(JSON.parse(request.responseText)))
    } else {
      resolve(JSON.parse(request.responseText))
    }
  }

  request.send()
})

const getSavedTracks = (accessToken) => new Promise((resolve, reject) => {
  const request = new XMLHttpRequest()
  request.open('GET', 'https://api.spotify.com/v1/me/tracks')
  request.setRequestHeader('Authorization', `Bearer ${accessToken}`)

  request.onload = () => {
    if (request.status >= 400 && request.status <= 500) {
      reject(Error(JSON.parse(request.responseText)))
    } else {
      resolve(JSON.parse(request.responseText))
    }
  }

  request.send()
})

const song = {
  id: '9',
  name: 'Still Goin Down',
  author: 'Morgan Wallen',
  imgUrl: 'https://i.scdn.co/image/ab67616d00001e028186bf9413a587a7061b9755',
  selected: false
}

const Home = () => {
  const [accessToken, setAccessToken] = useState(null)
  const [user, setUser] = useState({ name: 'Vitor' })
  const [songs, setSongs] = useState([
    song,
    {
      id: '10',
      name: 'Snow',
      author: 'Zach Bryan',
      imgUrl: 'https://i.scdn.co/image/ab67616d00001e028186bf9413a587a7061b9755',
      selected: false
    },
    {
      id: '11',
      name: 'Traveling Man',
      author: 'Zach Bryan',
      imgUrl: 'https://i.scdn.co/image/ab67616d00001e028186bf9413a587a7061b9755',
      selected: false
    },
    {
      id: '12',
      name: 'Oklahoma City',
      author: 'Zach Bryan',
      imgUrl: 'https://i.scdn.co/image/ab67616d00001e028186bf9413a587a7061b9755',
      selected: false
    }, 
    {
      id: '13',
      name: 'Rap God',
      author: 'Eminem',
      imgUrl: 'https://i.scdn.co/image/ab67616d00001e028186bf9413a587a7061b9755',
      selected: false
    },
    {
      id: '14',
      name: 'Little Rain',
      author: 'Morgan Wallen',
      imgUrl: 'https://i.scdn.co/image/ab67616d00001e028186bf9413a587a7061b9755',
      selected: false
    }
  ])
  const swipeBtns = useRef(null)

  const scopes = 'user-read-private, user-library-read'

  const handlers = useSwipeable({
    onSwiping: (swipeData) => {
      const { target } = swipeData.event
      const { deltaX, deltaY } = swipeData

      target.style.transform = `
        translate(${deltaX / 2}px, ${deltaY < 0 ? deltaY / 2 : 0}px) 
        rotate(${deltaX / 5}deg)
      `
      swipeBtns.current.style.transform = `rotate(${deltaX / 15}deg)`
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  })

  useEffect(() => {
    document.body.classList.add('bg-purple', 'text-white', 'antialiased')
    document.documentElement.style.setProperty('--vh', `${window.innerHeight/100}px`);

    const hashParams = getHashParams()

    if (hashParams.access_token) {
      setAccessToken(hashParams.access_token)

      getProfile(hashParams.access_token)
        .then(data => {
          setUser({
            name: data.display_name
          })
        })
        .catch(err => console.error(err))

      getSavedTracks(hashParams.access_token)
        .then(tracks => {
          console.log(tracks)
        })
        .catch(err => {
          console.error(err)
        })
    }
  }, [])

  const handleLogin = () => {
    let url = 'https://accounts.spotify.com/authorize'

    url += '?response_type=token';
    url += '&client_id=' + encodeURIComponent(REACT_APP_CLIENT_ID)
    url += '&scope=' + encodeURIComponent(scopes)
    url += '&redirect_uri=' + encodeURIComponent(REACT_APP_REDIRECT_URI)
    
    window.location = url
  }
  
  const handleSelectSong = (id) => {
    setSongs(songs => songs.map(s => s.id === id ? { ...s, selected: !s.selected } : s))
    console.log(songs)
  }

  return (
    <div className='text-white'>
      <div className='min-h-screen'>
        <div className='p-8'>
          <div className='flex flex-col md:flex-row justify-between'>
            <div className='flex flex-col font-bold'>
              <h1 className='font-bold text-3xl text-gray-text mb-2'>Spotiswipe</h1>
              {!user && <p className='font-bold text-xl md:text-2xl text-green-200'>Find amazing songs by swiping, just like Tinder.</p>}
            </div>
          </div>
          <div>
            {!user && 
            <button onClick={handleLogin} className='rounded flex flex-row items-center bg-green-500 p-2'>
              <img src='/spotify.svg' width={16} height={16} className='mr-2'/>
              <span className='font-bold text-black'>Log-in with Spotify</span>
            </button>
            }
          </div>
        </div>
        <div className='px-8 text-green-200'>
          <div className='bg-blue-500 w-full md:w-96 m-0 m-auto h-96 rounded-lg overflow-hidden' {...handlers}>
            test
          </div>
          <div ref={swipeBtns} className='mt-5 w-28 h-12 py-3 px-6 m-0 m-auto flex flex-row items-center justify-between rounded-full bg-white'>
              <Cross className='w-5 h-5 object-contain' fill='red' width="16px"/>
              <Mark className='w-5 h-5' fill='green' />
            </div>
        </div>
      </div>
      <footer className='mt-10 p-10 bg-gray-800 h-72 w-full'>
        <div>
          <h2>Spotiswipe does not use your Spotify data in any harmful way. Spotiswipe is open-sourced and its source code can be viewed on Github.</h2>
        </div>
      </footer>
    </div>
  )
}

ReactDOM.render(<Home />, document.getElementById('root'))
