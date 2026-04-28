import { format, parse, setHours, setMinutes, setSeconds } from 'date-fns'

const ENTRY_KEY_FORMAT = 'MM-dd-yy_hh:mm:ssaaa'
const READABLE_FORMAT = 'M-dd-yyyy h:mm:ss aaa'
const DATE_ONLY_FORMAT = 'MMMM d, yyyy'
const TIME_ONLY_FORMAT = 'h:mm:ss a'

export function formatEntryKey(date: Date): string {
  return format(date, ENTRY_KEY_FORMAT).toUpperCase()
}

export function formatEntryKeyReadable(entryKey: string): string {
  const normalizedKey = entryKey.replace(/(AM|PM)$/i, (match) => match.toLowerCase())
  const date = parse(normalizedKey, ENTRY_KEY_FORMAT, new Date())
  return format(date, READABLE_FORMAT).toUpperCase()
}

export function formatEntryKeyWithDate(customDate: Date): string {
  const now = new Date()
  const dateWithCurrentTime = setSeconds(
    setMinutes(
      setHours(customDate, now.getHours()),
      now.getMinutes()
    ),
    now.getSeconds()
  )
  return format(dateWithCurrentTime, ENTRY_KEY_FORMAT).toUpperCase()
}

export function formatEntryLabel(entryKey: string, hasMultipleEntries: boolean): string {
  const normalizedKey = entryKey.replace(/(AM|PM)$/i, (match) => match.toLowerCase())
  const date = parse(normalizedKey, ENTRY_KEY_FORMAT, new Date())

  if (hasMultipleEntries) {
    return `${format(date, DATE_ONLY_FORMAT)}  ${format(date, TIME_ONLY_FORMAT)}`
  }
  return format(date, DATE_ONLY_FORMAT)
}
