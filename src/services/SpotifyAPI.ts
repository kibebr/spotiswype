export const getProfile = (accessToken: string) => new Promise((resolve, reject) => {
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

export const getSavedTracks = (accessToken: string) => new Promise((resolve, reject) => {
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
