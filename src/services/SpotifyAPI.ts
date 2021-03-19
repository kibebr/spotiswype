type HttpRequestType
  = 'GET'
  | 'POST'

interface Settings {
  type: HttpRequestType
  params: string
}

const newSpotifyRequest = ({ type, params }: Settings) => async (accessToken: string) => await new Promise<unknown>(
  (resolve, reject) => {
    const request = new XMLHttpRequest()

    request.open(type, `https://api.spotify.com/v1/${params}`)
    request.setRequestHeader('Authorization', `Bearer ${accessToken}`)

    request.onload = (): void => {
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
  params: 'me'
})

export const getSavedTracks = newSpotifyRequest({
  type: 'GET',
  params: 'me/tracks'
})

export const getSeveralArtists = (artistsIds: string[]) => newSpotifyRequest({
  type: 'GET',
  params: `artists?ids=${artistsIds.join()}`
})

export const getRecommendedSongs = (seedTracks: string[]) => (seedArtists: string[]) => (seedGenres: string[]) => newSpotifyRequest({
  type: 'GET',
  params: `recommendations?seed_tracks=${seedTracks.join()}&seed_artists=${seedArtists.join()}&seedGenres=${seedGenres.join().replace(' ', '+')}`
})

export const getPlaylists = newSpotifyRequest({
  type: 'GET',
  params: 'me/playlists'
})

export const getPlaylistTracks = (playlistId: string) => newSpotifyRequest({
  type: 'GET',
  params: `playlists/${playlistId}/tracks?market=ES`
})

export const getFeaturedPlaylists = newSpotifyRequest({
  type: 'GET',
  params: 'browse/featured-playlists'
})
