/* eslint-disable @typescript-eslint/no-floating-promises */

import React, { useEffect, useState } from 'react'
import { render } from 'react-dom'
import { isLeft } from 'fp-ts/Either'
import { SongCard } from './components/SongCard'
import { Container } from './components/Container'
import { Deck } from './components/Deck'
import { LoadingIndicator } from './components/LoadingIndicator'
import { ReactComponent as CrossIcon } from './assets/cross.svg'
import { ReactComponent as SpotifyIcon } from './assets/spotify.svg'
import { SwipeButtons } from './components/SwipeButtons'
import { getRecommendedFromPlaylist, getRecommendedFromLikedSongs } from './api/spotify/spotifyapi'
import { dropRight } from 'fp-ts/Array'
import { handleLogin, handleFetchUser } from './api/spotify/login'
import { createSwipeable } from './swipehandler'
import { usePalette } from 'react-palette'
import { Playlist } from './domain/Playlist'
import { User } from './domain/User'
import { Song } from './domain/Song'
import './index.css'

export type SwipeDirection
  = 'LEFT'
  | 'RIGHT'

const Home = (): JSX.Element => {
  return (
    <div>
      <button>
        Log-in
      </button>
    </div>
  )
}

render(<Home />, document.getElementById('root'))

// TODO: let user decide if swiped-right songs will be added to a certain playlist automatically
