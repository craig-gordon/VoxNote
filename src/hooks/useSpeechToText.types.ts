export type RecordingState = 'idle' | 'recording' | 'transcribing'

export interface UseSpeechToTextReturn {
  isRecording: boolean
  isTranscribing: boolean
  transcript: string
  recordingState: RecordingState
  hasRecordedAudio: boolean
  recordingDuration: number
  startRecording: () => Promise<void>
  stopRecording: () => void
  clearTranscript: () => void
  playRecording: () => void
  persistAudio: (entryKey: string) => Promise<void>
}
