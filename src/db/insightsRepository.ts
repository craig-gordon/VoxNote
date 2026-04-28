import { getNeonClient } from './neonClient'
import type { EntryWithContent } from './entryRepository'
import type { InsightsResult } from '../utils/generateInsights'

export type FeedbackType = 'positive' | 'neutral' | 'negative'

export interface StoredInsight {
  id: number
  entries_snapshot: EntryWithContent[]
  entry_count: number
  result: InsightsResult
  feedback: FeedbackType | null
  created_at: string
}

export async function saveInsight(
  entriesSnapshot: EntryWithContent[],
  result: InsightsResult
): Promise<StoredInsight> {
  const sql = getNeonClient()
  const rows = await sql`
    INSERT INTO insights (entries_snapshot, entry_count, result)
    VALUES (${JSON.stringify(entriesSnapshot)}, ${entriesSnapshot.length}, ${JSON.stringify(result)})
    RETURNING *
  `
  return parseInsightRow(rows[0])
}

export async function getLatestInsight(): Promise<StoredInsight | null> {
  const sql = getNeonClient()
  const rows = await sql`
    SELECT * FROM insights ORDER BY created_at DESC LIMIT 1
  `
  if (rows.length === 0) return null
  return parseInsightRow(rows[0])
}

export async function updateInsightFeedback(
  id: number,
  feedback: FeedbackType
): Promise<void> {
  const sql = getNeonClient()
  await sql`
    UPDATE insights SET feedback = ${feedback} WHERE id = ${id}
  `
}

function parseInsightRow(row: Record<string, unknown>): StoredInsight {
  return {
    id: row.id as number,
    entries_snapshot: row.entries_snapshot as EntryWithContent[],
    entry_count: row.entry_count as number,
    result: row.result as InsightsResult,
    feedback: row.feedback as FeedbackType | null,
    created_at: row.created_at as string,
  }
}
