import { chatCompletion, type ChatMessage } from './llmApi'
import type { EntryWithContent } from '../db/entryRepository'

export type InsightType = 'pattern' | 'connection' | 'question' | 'suggestion'

export interface InsightItem {
  type: InsightType
  title: string
  description: string
  icon: string
}

export interface InsightsResult {
  insights: InsightItem[]
  analyzedEntryCount: number
}

const SYSTEM_PROMPT = `You are a thoughtful journal analyst. Your job is to provide genuine insight—not summaries.

CRITICAL RULES:
1. NEVER restate what the user already said. They wrote it; they know it.
2. CONSOLIDATE related themes into ONE insight. If multiple entries touch on the same topic, that's ONE insight about a pattern, not separate items.
3. ADD ANALYTICAL VALUE: identify cause/effect relationships, contradictions, or non-obvious patterns the user may not have noticed.
4. Return 2-4 insights maximum. Fewer high-quality insights beat more repetitive ones.

INSIGHT TYPES (use the most appropriate):
- "pattern": Recurring behavior or theme across multiple entries
- "connection": A link between two things the user mentioned separately (e.g., "You felt energized on days you exercised")
- "question": A thoughtful prompt encouraging deeper reflection (not rhetorical fluff)
- "suggestion": ONE specific, actionable next step based on what seems to be working or not

CONTEXT-BASED APPROACH:
- With 1 entry: Don't force patterns. Focus on 1-2 reflection questions and maybe 1 suggestion. Acknowledge limited data.
- With 2-3 entries: Look for emerging patterns or connections between entries.
- With 4+ entries: Full pattern analysis across the month.

FORMAT:
Return a JSON object with an "insights" array. Each insight has:
- type: one of "pattern", "connection", "question", "suggestion"
- title: 4-7 words, specific (not generic like "Positive Mindset Observed")
- description: 1-2 sentences that ADD VALUE beyond what the user wrote
- icon: Ionicons name (e.g., "link-outline", "help-circle-outline", "bulb-outline", "repeat-outline", "flash-outline", "heart-outline")

IMPORTANT: Return ONLY valid JSON, no markdown or explanation.`

function formatEntriesForPrompt(entries: EntryWithContent[]): string {
  return entries
    .map((e) => {
      const datePart = e.entry_key.slice(0, 8)
      return `[${datePart}]\n${e.content}`
    })
    .join('\n\n---\n\n')
}

export async function generateInsights(
  entries: EntryWithContent[],
  apiKey: string
): Promise<InsightsResult> {
  if (entries.length === 0) {
    return { insights: [], analyzedEntryCount: 0 }
  }

  const formattedEntries = formatEntriesForPrompt(entries)
  const entryCountContext = entries.length === 1
    ? 'Note: There is only 1 entry this month. Focus on reflection questions rather than forcing patterns.'
    : `Note: There are ${entries.length} entries to analyze.`

  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: `${entryCountContext}\n\nHere are my journal entries from the past month:\n\n${formattedEntries}` },
  ]

  const result = await chatCompletion(messages, { apiKey })

  const parsed = JSON.parse(result.content)
  const insights: InsightItem[] = parsed.insights || []

  return {
    insights,
    analyzedEntryCount: entries.length,
  }
}
