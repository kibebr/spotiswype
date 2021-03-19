import { SwipeDirection } from './index'
import { Song } from './domain/Song'
import { SwipeableHandlers, useSwipeable } from 'react-swipeable'

export const createSwipeable = (onSwipe: (d: SwipeDirection) => unknown, songs: Song[]): SwipeableHandlers => useSwipeable({
  onSwiped: ({ event, absX, deltaX, deltaY, vxvy }) => {
    const target = event.target as HTMLElement
    const moveOutWidth = document.body.clientWidth
    const shouldKeep = absX < 80 || Math.abs(vxvy[0]) < 0.5

    if (shouldKeep) {
      target.style.transform = ''
    } else {
      const endX = Math.max(Math.abs(vxvy[0]) * moveOutWidth, moveOutWidth)
      const toX = deltaX > 0 ? endX : -endX
      const endY = Math.abs(vxvy[1]) * moveOutWidth
      const toY = deltaY > 0 ? endY : -endY

      const xMulti = deltaX * 0.03
      const yMulti = deltaY / 80
      const rotate = xMulti * yMulti

      target.style.transform = `translate(${toX}px, ${toY - deltaY}px) rotate(${rotate}deg)`
      onSwipe(toX > 0 ? 'RIGHT' : 'LEFT')
    }
  },
  onSwiping: ({ deltaX, deltaY, event }) => {
    const target = event.target as HTMLElement

    if (!target.classList.contains('card') || Number(target.id) !== songs.length - 1) {
      return
    }

    target.classList.add('no-transition')

    const xMulti = deltaX * 0.03
    const yMulti = deltaY / 80
    const rotate = xMulti * yMulti

    target.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(${rotate}deg)`
    // console.log('onSwiped: ', deltaX, deltaY)
  },
  preventDefaultTouchmoveEvent: true,
  trackTouch: true,
  trackMouse: true
})
