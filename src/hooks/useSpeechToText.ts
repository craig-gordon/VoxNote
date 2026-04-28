import { useState, useRef, useCallback, useEffect } from 'react'
import { useAudioRecorder } from '@siteed/audio-studio'
import { createAudioPlayer } from 'expo-audio'
import type { AudioPlayer } from 'expo-audio'
import * as FileSystem from 'expo-file-system/legacy'
import { initWhisper, type WhisperContext } from 'whisper.rn'
import type { RecordingState, UseSpeechToTextReturn } from './useSpeechToText.types'

const MODEL_FILENAME = 'ggml-small.en.bin'

let whisperContext: WhisperContext | null = null
let whisperLoadPromise: Promise<WhisperContext> | null = null

function loadWhisperContext(): Promise<WhisperContext> {
  if (whisperContext) return Promise.resolve(whisperContext)
  if (whisperLoadPromise) return whisperLoadPromise

  console.log('Loading Whisper model...')
  const startTime = Date.now()
  whisperLoadPromise = initWhisper({ filePath: MODEL_FILENAME, isBundleAsset: true })
    .then((ctx) => {
      whisperContext = ctx
      console.log('Whisper model loaded in', ((Date.now() - startTime) / 1000).toFixed(1), 'seconds')
      return ctx
    })
    .catch((err) => {
      whisperLoadPromise = null
      throw err
    })
  return whisperLoadPromise
}

export function useSpeechToText(): UseSpeechToTextReturn {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle')
  const [transcript, setTranscript] = useState('')
  const [hasRecordedAudio, setHasRecordedAudio] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)

  const lastRecordingUriRef = useRef<string | null>(null)
  const playerRef = useRef<AudioPlayer | null>(null)

  const recorder = useAudioRecorder()

  // Eagerly load Whisper in the background so it's ready by the time the user finishes a recording.
  useEffect(() => {
    loadWhisperContext().catch((err) => {
      console.error('Failed to preload Whisper model:', err)
    })
  }, [])

  // Mirror recorder.durationMs into our seconds counter
  useEffect(() => {
    setRecordingDuration(Math.floor(recorder.durationMs / 1000))
  }, [recorder.durationMs])

  const startRecording = useCallback(async () => {
    if (recordingState !== 'idle') return

    try {
      await recorder.startRecording({
        sampleRate: 16000,
        channels: 1,
        encoding: 'pcm_16bit',
        keepAwake: true,
      })
      setRecordingState('recording')
      setRecordingDuration(0)
      console.log('Recording started')
    } catch (error) {
      console.error('Failed to start recording:', error)
      setRecordingState('idle')
    }
  }, [recordingState, recorder])

  const stopRecording = useCallback(async () => {
    if (recordingState !== 'recording') return

    try {
      const result = await recorder.stopRecording()
      const uri = result.fileUri

      if (!uri) {
        console.error('No recording URI')
        setTranscript('[Recording failed]')
        setRecordingState('idle')
        return
      }

      lastRecordingUriRef.current = uri
      setHasRecordedAudio(true)
      console.log('Recording URI:', uri, 'duration:', result.durationMs, 'ms')

      const fileSizeKB = (result.size || 0) / 1024
      console.log('Audio recorded:', fileSizeKB.toFixed(1), 'KB')

      if (fileSizeKB < 10) {
        console.warn('Recording too short:', fileSizeKB.toFixed(1), 'KB')
        setTranscript('[Recording too short — please try again]')
        setRecordingState('idle')
        return
      }

      setRecordingState('transcribing')
      console.log('Transcribing locally with whisper.rn...')
      const startTime = Date.now()
      const ctx = await loadWhisperContext()
      const { promise } = ctx.transcribe(uri, { language: 'en' })
      const transcribeResult = await promise

      console.log('Transcription completed in', ((Date.now() - startTime) / 1000).toFixed(1), 'seconds')
      setTranscript(transcribeResult.result.trim())
    } catch (error) {
      console.error('Transcription error:', error)
      setTranscript('[Transcription failed]')
    }

    setRecordingState('idle')
  }, [recordingState, recorder])

  const clearTranscript = useCallback(() => {
    setTranscript('')
    lastRecordingUriRef.current = null
    setHasRecordedAudio(false)
  }, [])

  const persistAudio = useCallback(async (entryKey: string) => {
    const uri = lastRecordingUriRef.current
    if (!uri) return

    const audioDir = `${FileSystem.documentDirectory}audio/`
    const dirInfo = await FileSystem.getInfoAsync(audioDir)
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(audioDir, { intermediates: true })
    }

    const safeFilename = entryKey.replace(/:/g, '-')
    await FileSystem.copyAsync({ from: uri, to: `${audioDir}${safeFilename}.wav` })
    console.log('Audio persisted for entry:', entryKey)
  }, [])

  const playRecording = useCallback(() => {
    const uri = lastRecordingUriRef.current
    if (!uri) {
      console.warn('No recorded audio to play')
      return
    }

    try {
      if (playerRef.current) {
        playerRef.current.remove()
      }
      const player = createAudioPlayer(uri)
      playerRef.current = player
      player.play()
    } catch (error) {
      console.error('Failed to play audio:', error)
    }
  }, [])

  return {
    isRecording: recordingState === 'recording',
    isTranscribing: recordingState === 'transcribing',
    transcript,
    recordingState,
    hasRecordedAudio,
    recordingDuration,
    startRecording,
    stopRecording,
    clearTranscript,
    playRecording,
    persistAudio,
  }
}
