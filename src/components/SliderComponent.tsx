import React, { FunctionComponent } from 'react'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

interface SlickProps {
  children: React.ReactNode
}

const slickSettings = {
  infinite: false,
  draggable: true,
  slidesToShow: 3,
  className: 'cursor-grab'
}

export const SliderComponent: FunctionComponent<SlickProps> = ({ children }) => (
  <Slider {...slickSettings}>
    {children}
  </Slider>
)
