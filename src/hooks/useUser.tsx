/* eslint-disable @typescript-eslint/no-floating-promises */

import { useState, useEffect } from 'react'
import { User } from '../domain/User'
import { handleFetchUser } from '../api/spotify/login'
import * as O from 'fp-ts/Option'
import * as E from 'fp-ts/Either'
import * as F from 'fp-ts/function'

type UseUser = O.Option<User>
type UseUserProps = {
  handleAPIError: (error: Error) => void
}

export const useUser = ({ handleAPIError }: UseUserProps): UseUser => {
  const [user, setUser] = useState<O.Option<User>>(O.none)

  useEffect(() => {
    handleFetchUser().then(E.fold(
      F.flow(E.toError, handleAPIError),
      F.flow(O.some, setUser)
    ))
  }, [])

  return user
}
