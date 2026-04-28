import { useState, useCallback, useRef, useEffect } from 'react'
import { createAudioPlayer } from 'expo-audio'
import type { AudioPlayer } from 'expo-audio'
import * as FileSystem from 'expo-file-system/legacy'

const AUDIO_DIR = `${FileSystem.documentDirectory}audio/`

function getAudioPath(entryKey: string): string {
  const safeFilename = entryKey.replace(/:/g, '-')
  return `${AUDIO_DIR}${safeFilename}.wav`
}

export function useAudioPlayback(entryKey: string | null) {
  const [hasAudio, setHasAudio] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const playerRef = useRef<AudioPlayer | null>(null)

  const releasePlayer = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.remove()
      playerRef.current = null
    }
    setIsPlaying(false)
  }, [])

  useEffect(() => {
    releasePlayer()

    if (!entryKey) {
      setHasAudio(false)
      return
    }

    FileSystem.getInfoAsync(getAudioPath(entryKey)).then((info) => {
      setHasAudio(info.exists)
    })
  }, [entryKey, releasePlayer])

  useEffect(() => {
    return () => {
      if (playerRef.current) {
        playerRef.current.remove()
      }
    }
  }, [])

  const play = useCallback(async () => {
    if (!entryKey) return

    releasePlayer()

    const player = createAudioPlayer(getAudioPath(entryKey))
    playerRef.current = player

    const subscription = player.addListener('playbackStatusUpdate', (status) => {
      if (status.didJustFinish) {
        setIsPlaying(false)
      }
    })

    player.play()
    setIsPlaying(true)

    const currentPlayer = playerRef.current
    return () => {
      subscription.remove()
      currentPlayer?.remove()
    }
  }, [entryKey, releasePlayer])

  const stop = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.pause()
      setIsPlaying(false)
    }
  }, [])

  return { hasAudio, isPlaying, play, stop }
}
