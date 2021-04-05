import React, { FunctionComponent } from 'react'

export const Container: FunctionComponent = ({ children }): JSX.Element => (
  <div className='m-0 m-auto max-w-screen-md'>
    {children}
  </div>
)
