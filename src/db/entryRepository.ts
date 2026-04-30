import { getNeonClient } from './neonClient'
import { deleteAudio } from '../storage/audioStorage'

interface EntryKeyRow {
  entry_key: string
}

interface ContentRow {
  content: string
}

export async function getAllEntryKeys(): Promise<string[]> {
  const sql = getNeonClient()
  const result = (await sql`SELECT entry_key FROM journal_entries ORDER BY entry_key DESC`) as EntryKeyRow[]
  return result.map((row) => row.entry_key)
}

export async function saveEntry(entryKey: string, content: string): Promise<void> {
  const sql = getNeonClient()
  await sql`INSERT INTO journal_entries (entry_key, content) VALUES (${entryKey}, ${content})
            ON CONFLICT (entry_key) DO UPDATE SET content = ${content}`
}

export async function loadEntry(entryKey: string): Promise<string | null> {
  const sql = getNeonClient()
  const result = (await sql`SELECT content FROM journal_entries WHERE entry_key = ${entryKey}`) as ContentRow[]
  return result.length > 0 ? result[0].content : null
}

interface AudioKeyRow {
  audio_key: string | null
}

export async function getAudioKey(entryKey: string): Promise<string | null> {
  const sql = getNeonClient()
  const result = (await sql`SELECT audio_key FROM journal_entries WHERE entry_key = ${entryKey}`) as AudioKeyRow[]
  return result.length > 0 ? result[0].audio_key : null
}

export async function setAudioKey(entryKey: string, audioKey: string): Promise<void> {
  const sql = getNeonClient()
  await sql`UPDATE journal_entries SET audio_key = ${audioKey} WHERE entry_key = ${entryKey}`
}

interface EntryAudioRow {
  entry_key: string
  audio_key: string | null
}

export async function getAllAudioKeys(): Promise<Map<string, string | null>> {
  const sql = getNeonClient()
  const rows = (await sql`SELECT entry_key, audio_key FROM journal_entries`) as EntryAudioRow[]
  const map = new Map<string, string | null>()
  for (const row of rows) {
    map.set(row.entry_key, row.audio_key)
  }
  return map
}

export async function deleteEntry(entryKey: string): Promise<void> {
  const sql = getNeonClient()
  const audioKey = await getAudioKey(entryKey)
  if (audioKey) {
    try {
      await deleteAudio(audioKey)
    } catch (err) {
      console.warn('Failed to delete audio from R2 (continuing with DB delete):', err)
    }
  }
  await sql`DELETE FROM journal_entries WHERE entry_key = ${entryKey}`
}

export async function deleteAllEntries(): Promise<void> {
  const sql = getNeonClient()
  const rows = (await sql`SELECT audio_key FROM journal_entries WHERE audio_key IS NOT NULL`) as AudioKeyRow[]
  await Promise.all(
    rows.map((row) =>
      row.audio_key
        ? deleteAudio(row.audio_key).catch((err) => {
            console.warn('Failed to delete audio from R2 (continuing):', err)
          })
        : Promise.resolve(),
    ),
  )
  await sql`DELETE FROM journal_entries`
}

export interface EntryWithContent {
  entry_key: string
  content: string
}

export async function getEntriesForDateRange(startDate: Date, endDate: Date): Promise<EntryWithContent[]> {
  const sql = getNeonClient()
  const result = (await sql`
    SELECT entry_key, content
    FROM journal_entries
    WHERE created_at >= ${startDate.toISOString()} AND created_at <= ${endDate.toISOString()}
    ORDER BY created_at DESC
  `) as EntryWithContent[]
  return result
}
