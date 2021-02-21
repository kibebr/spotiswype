interface HashParams {
  [key: string]: string
}

export const getHashParams = () => {
  var hashParams: HashParams = {}
  var e; var r = /([^&;=]+)=?([^&;]*)/g
  var q = window.location.hash.substring(1)

  e = r.exec(q)

  while (e) {
    hashParams[e[1]] = decodeURIComponent(e[2])
    e = r.exec(q)
  }

  return hashParams
}
