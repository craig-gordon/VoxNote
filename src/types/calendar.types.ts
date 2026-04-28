export interface MarkedDate {
  marked?: boolean
  dotColor?: string
  selected?: boolean
  selectedColor?: string
}

export type MarkedDatesType = Record<string, MarkedDate>

export interface CalendarEntry {
  key: string
  content: string
}

export interface EntriesByDate {
  [date: string]: string[]
}
