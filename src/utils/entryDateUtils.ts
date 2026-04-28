import { parse, format, subDays, startOfDay } from 'date-fns'
import type { MarkedDatesType, EntriesByDate } from '../types/calendar.types'

const ENTRY_KEY_FORMAT = 'MM-dd-yy_hh:mm:ssaaa'
const CALENDAR_DATE_FORMAT = 'yyyy-MM-dd'

export function getDateFromEntryKey(entryKey: string): string {
  const normalizedKey = entryKey.replace(/(AM|PM)$/i, (match) => match.toLowerCase())
  const date = parse(normalizedKey, ENTRY_KEY_FORMAT, new Date())
  return format(date, CALENDAR_DATE_FORMAT)
}

export function groupEntriesByDate(entryKeys: string[]): EntriesByDate {
  const grouped: EntriesByDate = {}

  for (const key of entryKeys) {
    const date = getDateFromEntryKey(key)
    if (!grouped[date]) {
      grouped[date] = []
    }
    grouped[date].push(key)
  }

  return grouped
}

export function generateMarkedDates(
  entryKeys: string[],
  selectedDate?: string | null
): MarkedDatesType {
  const markedDates: MarkedDatesType = {}
  const entriesByDate = groupEntriesByDate(entryKeys)

  for (const date of Object.keys(entriesByDate)) {
    markedDates[date] = {
      marked: true,
      dotColor: '#007AFF',
    }
  }

  if (selectedDate) {
    markedDates[selectedDate] = {
      ...markedDates[selectedDate],
      selected: true,
      selectedColor: '#007AFF',
    }
  }

  return markedDates
}

export function findMostRecentEmptyDate(entryKeys: string[]): Date | null {
  const entriesByDate = groupEntriesByDate(entryKeys)
  const today = startOfDay(new Date())

  let checkDate = subDays(today, 1)
  const maxDaysBack = 30

  for (let i = 0; i < maxDaysBack; i++) {
    const dateStr = format(checkDate, CALENDAR_DATE_FORMAT)
    if (!entriesByDate[dateStr]) {
      return checkDate
    }
    checkDate = subDays(checkDate, 1)
  }

  return null
}

export function formatDateForDisplay(dateStr: string): string {
  const date = parse(dateStr, CALENDAR_DATE_FORMAT, new Date())
  return format(date, 'MMM d, yyyy')
}
