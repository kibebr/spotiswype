import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { getHashParams } from './utils.js'

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
  name: 'Still Goin Down',
  author: 'Morgan Wallen'
}
const songs = [
  song,
  {
    name: 'Snow',
    author: 'Zach Bryan'
  },
  {
    name: 'Traveling Man',
    author: 'Zach Bryan'
  },
  {
    name: 'Oklahoma City',
    author: 'Zach Bryan'
  }, 
  {
    name: 'Rap God',
    author: 'Eminem'
  },
  {
    name: 'Little Rain',
    author: 'Morgan Wallen'
  }
]

const Home = () => {
  const [counter, setCounter] = useState(0)
  const [accessToken, setAccessToken] = useState(null)
  const [user, setUser] = useState({ name: 'Vitor' })
  const [selectedSongs, setSelectedSongs] = useState(null)

  const scopes = 'user-read-private, user-library-read'

  useEffect(() => {
    document.body.classList.add('bg-black', 'text-white', 'antialiased')
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

  return (
    <div className='text-white'>
      <div className='min-h-screen'>
        <div className='p-10'>
          <div className='flex flex-col md:flex-row justify-between mb-5'>
            <div className='flex flex-col font-bold'>
              <h1 className='font-bold text-4xl md:text-6xl text-green-400 mb-2'>Spotiswipe</h1>
              {!user && <p className='font-bold text-xl md:text-2xl text-green-200'>Tinder-like app to find recommended songs.</p>}
            </div>
            {user && <p className='font-bold mt-2 md:self-end text-white'>Hey {user.name}, you're in! Select a few songs to get started.</p>}
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
        <div className='px-10 text-green-200'>
          <ul>
            {
              songs.map(({ name, author }) => 
              <li className='p-5 justify-start items-center bg-graygray rounded mb-2 flex flex-row cursor-pointer'>
                <div className='w-6 h-6 bg-white rounded mr-5'>
                </div>
                <div className='flex flex-col'>
                  <span className='font-bold'>{name}</span>
                  <span>by {author}</span>
                </div>
              </li>
            )}
          </ul>
          <button className='rounded p-2 bg-white font-bold'>Start swiping!</button>
        </div>
      </div>
      <footer className='p-10 bg-gray-800 h-72 w-full'>
        <div>
          <h2>Spotiswipe does not use your Spotify data in any harmful way. Spotiswipe is open-sourced and its source code can be viewed on Github.</h2>
        </div>
      </footer>
    </div>
  )
}

ReactDOM.render(<Home />, document.getElementById('root'))
