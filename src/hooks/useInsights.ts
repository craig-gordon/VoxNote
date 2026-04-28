import { useState, useCallback, useRef } from 'react'
import { getEntriesForDateRange } from '../db/entryRepository'
import { saveInsight, getLatestInsight, updateInsightFeedback, type StoredInsight, type FeedbackType } from '../db/insightsRepository'
import { generateInsights } from '../utils/generateInsights'

export interface UseInsightsReturn {
  insight: StoredInsight | null
  isLoading: boolean
  isGenerating: boolean
  error: string | null
  loadLatestInsight: () => Promise<void>
  generateNewInsight: () => Promise<void>
  submitFeedback: (feedback: FeedbackType) => Promise<void>
}

export function useInsights(apiKey: string | undefined): UseInsightsReturn {
  const [insight, setInsight] = useState<StoredInsight | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isOperationInProgress = useRef(false)

  const loadLatestInsight = useCallback(async () => {
    if (isOperationInProgress.current) return
    isOperationInProgress.current = true
    setIsLoading(true)
    setError(null)

    try {
      const latest = await getLatestInsight()
      setInsight(latest)
    } catch (err) {
      console.error('Failed to load insight:', err)
      setError(err instanceof Error ? err.message : 'Failed to load insight')
    } finally {
      setIsLoading(false)
      isOperationInProgress.current = false
    }
  }, [])

  const generateNewInsight = useCallback(async () => {
    if (!apiKey) {
      setError('API key not configured')
      return
    }

    if (isOperationInProgress.current) return
    isOperationInProgress.current = true
    setIsGenerating(true)
    setError(null)

    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 30)

      const entries = await getEntriesForDateRange(startDate, endDate)
      const result = await generateInsights(entries, apiKey)

      const saved = await saveInsight(entries, result)
      setInsight(saved)
    } catch (err) {
      console.error('Failed to generate insight:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate insight')
    } finally {
      setIsGenerating(false)
      isOperationInProgress.current = false
    }
  }, [apiKey])

  const submitFeedback = useCallback(async (feedback: FeedbackType) => {
    if (!insight) return

    try {
      await updateInsightFeedback(insight.id, feedback)
      setInsight({ ...insight, feedback })
    } catch (err) {
      console.error('Failed to submit feedback:', err)
    }
  }, [insight])

  return {
    insight,
    isLoading,
    isGenerating,
    error,
    loadLatestInsight,
    generateNewInsight,
    submitFeedback,
  }
}

export type { FeedbackType } from '../db/insightsRepository'
