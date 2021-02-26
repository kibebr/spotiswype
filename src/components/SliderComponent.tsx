import React from 'react'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

interface SlickProps {
  children: React.ReactNode
}

const slickSettings = {
  infinite: false,
  draggable: true,
  slidesToShow: 3
}

export const SliderComponent = ({ children }: SlickProps): JSX.Element => {
  return (
    <Slider {...slickSettings}>
      {children}
    </Slider>
  )
}
