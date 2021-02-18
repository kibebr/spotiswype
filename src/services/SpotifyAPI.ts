type HttpRequestType = 'GET' | 'POST'

const newSpotifyRequest = (settings: { type: HttpRequestType, url: string }) => (accessToken: string) => new Promise<unknown>(
  (resolve, reject) => {
    const request = new XMLHttpRequest()

    request.open(settings.type, settings.url)
    request.setRequestHeader('Authorization', `Bearer ${accessToken}`)

    request.onload = () => {
      if (request.status >= 400 && request.status <= 500) {
        reject(Error(JSON.parse(request.responseText)))
      } else {
        resolve(JSON.parse(request.responseText))
      }
    }

    request.send()
  }
)

export const getProfile = newSpotifyRequest({
  type: 'GET',
  url: 'https://api/spotify.com/v1/me'
})

export const getSavedTracks = newSpotifyRequest({
  type: 'GET',
  url: 'https://api.spotify.com/v1/me/tracks'
})

export const getSeveralArtists = (artistsIds: string[]) => newSpotifyRequest({
  type: 'GET',
  url: `https://api.spotify.com/v1/artists?ids=${artistsIds.join()}`
})

export const getRecommendedSongs = (seedTracks: string[]) => (seedArtists: string[]) => (seedGenres: string[]) => newSpotifyRequest({
  type: 'GET',
  url: `
    https://api.spotify.com/v1/recommendations?seed_tracks=${seedTracks.join()}&seed_artists=${seedArtists.join()}&seedGenres=${seedGenres.join().replace(' ', '+')}`
})
