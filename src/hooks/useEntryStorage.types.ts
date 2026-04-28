export interface UseEntryStorageReturn {
  entryKeys: string[]
  isLoading: boolean
  saveEntry: (content: string, customDate?: Date) => Promise<string>
  loadEntry: (key: string) => Promise<string | null>
  deleteEntry: (key: string) => Promise<void>
  deleteAllEntries: () => Promise<void>
  refreshEntries: () => Promise<string[]>
}

export const STORAGE_PREFIX = 'journal_'
