import { useState, useCallback, useRef, useEffect } from 'react'
import { createAudioPlayer } from 'expo-audio'
import type { AudioPlayer } from 'expo-audio'
import { getAudioKey } from '../db/entryRepository'
import { getPlaybackUrl } from '../storage/audioStorage'

export function useAudioPlayback(entryKey: string | null) {
  const [hasAudio, setHasAudio] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioKeyRef = useRef<string | null>(null)
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
    audioKeyRef.current = null

    if (!entryKey) {
      setHasAudio(false)
      return
    }

    let cancelled = false
    getAudioKey(entryKey).then((key) => {
      if (cancelled) return
      audioKeyRef.current = key
      setHasAudio(key !== null)
    })

    return () => {
      cancelled = true
    }
  }, [entryKey, releasePlayer])

  useEffect(() => {
    return () => {
      if (playerRef.current) {
        playerRef.current.remove()
      }
    }
  }, [])

  const play = useCallback(async () => {
    const audioKey = audioKeyRef.current
    if (!audioKey) return

    releasePlayer()

    try {
      // Regenerate the presigned URL on every play so paused/resumed-much-later sessions
      // never hit a stale signature.
      const url = await getPlaybackUrl(audioKey)
      console.log('Playback URL for', audioKey, ':', url)
      const player = createAudioPlayer({ uri: url })
      playerRef.current = player

      const subscription = player.addListener('playbackStatusUpdate', (status) => {
        console.log('playbackStatusUpdate:', JSON.stringify(status))
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
    } catch (err) {
      console.error('Playback error:', err)
    }
  }, [releasePlayer])

  const stop = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.pause()
      setIsPlaying(false)
    }
  }, [])

  return { hasAudio, isPlaying, play, stop }
}
