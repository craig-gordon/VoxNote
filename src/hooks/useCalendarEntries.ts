import { useState, useMemo } from 'react'
import {
  generateMarkedDates,
  groupEntriesByDate,
  findMostRecentEmptyDate,
} from '../utils/entryDateUtils'
import type { MarkedDatesType } from '../types/calendar.types'

interface UseCalendarEntriesReturn {
  selectedDate: string | null
  setSelectedDate: (date: string | null) => void
  markedDates: MarkedDatesType
  entriesForSelectedDate: string[]
  mostRecentEmptyDate: Date | null
}

export function useCalendarEntries(entryKeys: string[]): UseCalendarEntriesReturn {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const entriesByDate = useMemo(() => groupEntriesByDate(entryKeys), [entryKeys])

  const markedDates = useMemo(
    () => generateMarkedDates(entryKeys, selectedDate),
    [entryKeys, selectedDate]
  )

  const entriesForSelectedDate = useMemo(() => {
    if (!selectedDate) return []
    return entriesByDate[selectedDate] || []
  }, [selectedDate, entriesByDate])

  const mostRecentEmptyDate = useMemo(
    () => findMostRecentEmptyDate(entryKeys),
    [entryKeys]
  )

  return {
    selectedDate,
    setSelectedDate,
    markedDates,
    entriesForSelectedDate,
    mostRecentEmptyDate,
  }
}
