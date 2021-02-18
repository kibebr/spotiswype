export const getProfile = (accessToken: string) => new Promise<unknown>((resolve, reject) => {
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

export const getSavedTracks = (accessToken: string) => new Promise<unknown>((resolve, reject) => {
  console.log('getSavedTracks called!')
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

export const getArtist = (accessToken: string) => (artistId: string) => new Promise<unknown>((resolve, reject) => {
  const request = new XMLHttpRequest()

  request.open('GET', `https://api.spotify.com/v1/artists/${artistId}`)
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

export const getSeveralArtists = (accessToken: string) => (artistsIds: string[]) => new Promise<unknown>((resolve, reject) => {
  const request = new XMLHttpRequest()

  request.open('GET', `https://api.spotify.com/v1/artists?ids=${artistsIds.join()}`)
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

export const getRecommendedSongs = (accessToken: string) => (seedTracks: string[]) => (seedArtists: string[]) => (seedGenres: string[]) =>
  new Promise<unknown>((resolve, reject) => {
    console.log(accessToken, seedTracks, seedArtists, seedGenres)
    const request = new XMLHttpRequest()
    
    const _seedGenres = seedGenres.join().replace(' ', '+')
    request.open(
      'GET', 
      `https://api.spotify.com/v1/recommendations?seed_tracks=${seedTracks.join()}&seed_artists=${seedArtists.join()}&seedGenres=${_seedGenres}`
    )
    request.setRequestHeader('Authorization', `Bearer ${accessToken}`)

    request.onload = () => {
      if (request.status >= 400 && request.status <= 500) {
        console.error(JSON.parse(request.responseText))
        reject(Error(JSON.parse(request.responseText)))
      } else {
        resolve(JSON.parse(request.responseText))
      }
    }

    request.send()
  })

