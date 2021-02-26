import React from 'react'

export const Container = (children: React.ReactNode): JSX.Element => (
  <div className='p-4 m-0 m-auto md:py-8 max-w-screen-sm'>
    {children}
  </div>
)
