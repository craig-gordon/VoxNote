import { useState, useEffect, useCallback } from 'react'
import { formatEntryKey, formatEntryKeyWithDate } from '../utils/formatEntryKey'
import type { UseEntryStorageReturn } from './useEntryStorage.types'
import * as entryRepository from '../db/entryRepository'

export function useEntryStorage(): UseEntryStorageReturn {
  const [entryKeys, setEntryKeys] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refreshEntries = useCallback(async () => {
    const keys = await entryRepository.getAllEntryKeys()
    setEntryKeys(keys)
    return keys
  }, [])

  useEffect(() => {
    refreshEntries().then(() => {
      setIsLoading(false)
    })
  }, [refreshEntries])

  const saveEntry = useCallback(async (content: string, customDate?: Date): Promise<string> => {
    const key = customDate ? formatEntryKeyWithDate(customDate) : formatEntryKey(new Date())
    await entryRepository.saveEntry(key, content)
    const keys = await entryRepository.getAllEntryKeys()
    setEntryKeys(keys)
    return key
  }, [])

  const loadEntry = useCallback(async (key: string): Promise<string | null> => {
    return entryRepository.loadEntry(key)
  }, [])

  const deleteEntry = useCallback(async (key: string): Promise<void> => {
    await entryRepository.deleteEntry(key)
    const keys = await entryRepository.getAllEntryKeys()
    setEntryKeys(keys)
  }, [])

  const deleteAllEntries = useCallback(async (): Promise<void> => {
    await entryRepository.deleteAllEntries()
    setEntryKeys([])
  }, [])

  return {
    entryKeys,
    isLoading,
    saveEntry,
    loadEntry,
    deleteEntry,
    deleteAllEntries,
    refreshEntries,
  }
}

export type { UseEntryStorageReturn } from './useEntryStorage.types'
