import React, { FunctionComponent } from 'react'

export const Container: FunctionComponent = ({ children }): JSX.Element => (
  <div className='p-4 m-0 m-auto md:py-8 max-w-screen-md'>
    {children}
  </div>
)
