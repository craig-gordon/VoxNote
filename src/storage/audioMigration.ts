import * as FileSystem from 'expo-file-system/legacy'
import { getAllAudioKeys, setAudioKey } from '../db/entryRepository'
import { uploadAudio } from './audioStorage'

const LOCAL_AUDIO_DIR = `${FileSystem.documentDirectory}audio/`

/**
 * Scans the local upload-retry cache and reconciles it with R2 + DB state.
 *
 * - File matches an entry whose audio_key is null → upload to R2, set audio_key, delete local file.
 * - File matches an entry whose audio_key is already set → orphan from a prior cleanup miss; delete.
 * - File matches no entry (entry was deleted) → orphan; delete.
 *
 * Runs once per app launch; safe to retry indefinitely.
 */
export async function migrateLocalAudio(): Promise<void> {
  const dirInfo = await FileSystem.getInfoAsync(LOCAL_AUDIO_DIR)
  if (!dirInfo.exists) {
    console.log('Audio migration: no local audio directory; nothing to migrate')
    return
  }

  const filenames = await FileSystem.readDirectoryAsync(LOCAL_AUDIO_DIR)
  const wavFiles = filenames.filter((name) => name.endsWith('.wav'))
  console.log(`Audio migration: found ${wavFiles.length} local .wav file(s) in ${LOCAL_AUDIO_DIR}`)
  if (wavFiles.length === 0) return

  const audioKeysByEntry = await getAllAudioKeys()

  // Build a map from on-disk filename stem → real entry key. The persistAudio writer
  // replaces `:` in entry keys with `-`, so we need to undo that lossy mapping by
  // matching against the actual set of entry keys from the DB.
  const safeNameToEntryKey = new Map<string, string>()
  for (const entryKey of audioKeysByEntry.keys()) {
    safeNameToEntryKey.set(entryKey.replace(/:/g, '-'), entryKey)
  }

  let uploaded = 0
  let orphansDeleted = 0
  let failed = 0

  for (const filename of wavFiles) {
    const stem = filename.replace(/\.wav$/, '')
    const localPath = `${LOCAL_AUDIO_DIR}${filename}`
    const entryKey = safeNameToEntryKey.get(stem)

    if (!entryKey) {
      await FileSystem.deleteAsync(localPath, { idempotent: true })
      orphansDeleted++
      continue
    }

    const existingAudioKey = audioKeysByEntry.get(entryKey)
    if (existingAudioKey) {
      await FileSystem.deleteAsync(localPath, { idempotent: true })
      orphansDeleted++
      continue
    }

    try {
      const audioKey = await uploadAudio(entryKey, localPath)
      await setAudioKey(entryKey, audioKey)
      await FileSystem.deleteAsync(localPath, { idempotent: true })
      uploaded++
    } catch (err) {
      console.error(`Migration: upload failed for ${filename}, leaving for next launch:`, err)
      failed++
    }
  }

  if (uploaded || orphansDeleted || failed) {
    console.log(
      `Audio migration: uploaded=${uploaded}, orphansDeleted=${orphansDeleted}, failed=${failed}`,
    )
  }

  // If the directory is empty after cleanup, remove it so the next launch is a no-op.
  const remaining = await FileSystem.readDirectoryAsync(LOCAL_AUDIO_DIR)
  if (remaining.length === 0) {
    await FileSystem.deleteAsync(LOCAL_AUDIO_DIR, { idempotent: true })
  }
}
