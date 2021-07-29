/* eslint-disable @typescript-eslint/no-floating-promises */

import { useState, useEffect } from 'react'
import { Song } from '../domain/Song'
import * as O from 'fp-ts/Option'
import * as IO from 'fp-ts/IO'

type UseAudio = {
  isPlaying: boolean
  playSong: (song: Song) => IO.IO<void>
  resume: IO.IO<void>
  pause: IO.IO<void>
  toggle: IO.IO<void>
}

export const useAudio = (): UseAudio => {
  const [currentSong, setCurrentSong] = useState<O.Option<Song>>(O.none)
  const [audio, setAudio] = useState<O.Option<HTMLAudioElement>>(O.none)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)

  useEffect(() => {
    if (O.isSome(audio)) {
      audio.value.addEventListener('ended', () => setIsPlaying(false))
    }
  }, [audio])

  useEffect(() => {
    if (O.isSome(audio)) {
      isPlaying ? audio.value.play() : audio.value.pause()
    }
  }, [isPlaying, audio])

  useEffect(() => {
    if (O.isSome(audio)) {
      audio.value.pause()
    }

    if (O.isSome(currentSong)) {
      setAudio(O.some(new Audio(currentSong.value.audio)))
    }
  }, [currentSong])

  return {
    isPlaying,
    playSong: (song) => () => setCurrentSong(O.some(song)),
    resume: () => setIsPlaying(true),
    pause: () => setIsPlaying(false),
    toggle: () => setIsPlaying(!isPlaying)
  }
}
