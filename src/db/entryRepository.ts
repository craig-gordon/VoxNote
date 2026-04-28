import { getNeonClient } from './neonClient'

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

export async function deleteEntry(entryKey: string): Promise<void> {
  const sql = getNeonClient()
  await sql`DELETE FROM journal_entries WHERE entry_key = ${entryKey}`
}

export async function deleteAllEntries(): Promise<void> {
  const sql = getNeonClient()
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
