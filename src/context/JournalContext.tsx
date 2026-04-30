import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import Constants from 'expo-constants'
import { useSpeechToText } from '../hooks/useSpeechToText'
import { useEntryStorage, type UseEntryStorageReturn } from '../hooks/useEntryStorage'
import { useCalendarEntries } from '../hooks/useCalendarEntries'
import { useInsights, type UseInsightsReturn } from '../hooks/useInsights'
import type { FeedbackType } from '../db/insightsRepository'

const OPENAI_API_KEY = Constants.expoConfig?.extra?.openaiApiKey as string | undefined

interface SelectedEntry {
  key: string
  content: string
}

interface JournalContextValue {
  // Speech to text
  isRecording: boolean
  isTranscribing: boolean
  transcript: string
  hasRecordedAudio: boolean
  recordingDuration: number
  startRecording: () => Promise<void>
  stopRecording: () => void
  clearTranscript: () => void
  playRecording: () => void

  // Entry storage
  entryKeys: string[]
  isLoading: boolean
  saveEntry: (content: string, customDate?: Date) => Promise<string>
  loadEntry: (key: string) => Promise<string | null>
  deleteEntry: (key: string) => Promise<void>
  deleteAllEntries: () => Promise<void>
  refreshEntries: () => Promise<void>
  isRefreshing: boolean

  // Calendar entries
  selectedDate: string | null
  setSelectedDate: (date: string | null) => void
  markedDates: Record<string, { marked?: boolean; dotColor?: string; selected?: boolean; selectedColor?: string }>
  entriesForSelectedDate: string[]
  mostRecentEmptyDate: Date | null

  // Selected entry state
  selectedEntry: SelectedEntry | null
  setSelectedEntry: (entry: SelectedEntry | null) => void
  handleSelectEntry: (key: string) => Promise<void>

  // Insights
  insight: UseInsightsReturn['insight']
  insightsLoading: boolean
  insightsGenerating: boolean
  insightsError: string | null
  loadLatestInsight: () => Promise<void>
  generateNewInsight: () => Promise<void>
  submitInsightFeedback: (feedback: FeedbackType) => Promise<void>
}

const JournalContext = createContext<JournalContextValue | null>(null)

interface JournalProviderProps {
  children: ReactNode
}

export function JournalProvider({ children }: JournalProviderProps) {
  const [selectedEntry, setSelectedEntry] = useState<SelectedEntry | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const speechToText = useSpeechToText()
  const entryStorage = useEntryStorage()
  const calendarEntries = useCalendarEntries(entryStorage.entryKeys)
  const insightsHook = useInsights(OPENAI_API_KEY)

  useEffect(() => {
    insightsHook.loadLatestInsight()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const refreshEntries = useCallback(async () => {
    setIsRefreshing(true)
    await entryStorage.refreshEntries()
    setIsRefreshing(false)
  }, [entryStorage])

  const handleSelectEntry = useCallback(async (key: string) => {
    const content = await entryStorage.loadEntry(key)
    if (content) {
      setSelectedEntry({ key, content })
    }
  }, [entryStorage])

  const saveEntryAndRegenerateInsights = useCallback(async (content: string, customDate?: Date) => {
    const key = await entryStorage.saveEntry(content, customDate)
    await speechToText.persistAudio(key)
    insightsHook.generateNewInsight()
    return key
  }, [entryStorage, speechToText, insightsHook])

  const value: JournalContextValue = {
    isRecording: speechToText.isRecording,
    isTranscribing: speechToText.isTranscribing,
    transcript: speechToText.transcript,
    hasRecordedAudio: speechToText.hasRecordedAudio,
    recordingDuration: speechToText.recordingDuration,
    startRecording: speechToText.startRecording,
    stopRecording: speechToText.stopRecording,
    clearTranscript: speechToText.clearTranscript,
    playRecording: speechToText.playRecording,

    entryKeys: entryStorage.entryKeys,
    isLoading: entryStorage.isLoading,
    saveEntry: saveEntryAndRegenerateInsights,
    loadEntry: entryStorage.loadEntry,
    deleteEntry: entryStorage.deleteEntry,
    deleteAllEntries: entryStorage.deleteAllEntries,
    refreshEntries,
    isRefreshing,

    selectedDate: calendarEntries.selectedDate,
    setSelectedDate: calendarEntries.setSelectedDate,
    markedDates: calendarEntries.markedDates,
    entriesForSelectedDate: calendarEntries.entriesForSelectedDate,
    mostRecentEmptyDate: calendarEntries.mostRecentEmptyDate,

    selectedEntry,
    setSelectedEntry,
    handleSelectEntry,

    insight: insightsHook.insight,
    insightsLoading: insightsHook.isLoading,
    insightsGenerating: insightsHook.isGenerating,
    insightsError: insightsHook.error,
    loadLatestInsight: insightsHook.loadLatestInsight,
    generateNewInsight: insightsHook.generateNewInsight,
    submitInsightFeedback: insightsHook.submitFeedback,
  }

  return (
    <JournalContext.Provider value={value}>
      {children}
    </JournalContext.Provider>
  )
}

export function useJournal(): JournalContextValue {
  const context = useContext(JournalContext)
  if (!context) {
    throw new Error('useJournal must be used within a JournalProvider')
  }
  return context
}
