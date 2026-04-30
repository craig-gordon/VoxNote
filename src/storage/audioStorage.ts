import * as FileSystem from 'expo-file-system/legacy'
import { getAwsClient, getObjectUrl } from './r2Client'

const KEY_PREFIX = 'users/solo'
const PLAYBACK_URL_TTL_SECONDS = 3600

export function buildAudioKey(entryKey: string): string {
  const safe = entryKey.replace(/:/g, '-')
  return `${KEY_PREFIX}/${safe}.wav`
}

export async function uploadAudio(entryKey: string, localUri: string): Promise<string> {
  const audioKey = buildAudioKey(entryKey)
  const url = getObjectUrl(audioKey)
  const aws = getAwsClient()
  const signed = await aws.sign(url, {
    method: 'PUT',
    headers: {
      'x-amz-content-sha256': 'UNSIGNED-PAYLOAD',
      'Content-Type': 'audio/wav',
    },
  })

  const headers: Record<string, string> = {}
  signed.headers.forEach((value, key) => {
    const lower = key.toLowerCase()
    if (lower !== 'host' && lower !== 'content-length') {
      headers[key] = value
    }
  })

  const result = await FileSystem.uploadAsync(url, localUri, {
    httpMethod: 'PUT',
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    headers,
  })

  if (result.status < 200 || result.status >= 300) {
    throw new Error(`R2 upload failed (${result.status}): ${result.body}`)
  }
  return audioKey
}

export async function getPlaybackUrl(audioKey: string): Promise<string> {
  const baseUrl = getObjectUrl(audioKey)
  const url = new URL(baseUrl)
  url.searchParams.set('X-Amz-Expires', PLAYBACK_URL_TTL_SECONDS.toString())
  const aws = getAwsClient()
  const signed = await aws.sign(url.toString(), {
    method: 'GET',
    aws: { signQuery: true },
  })
  return signed.url
}

export async function deleteAudio(audioKey: string): Promise<void> {
  const url = getObjectUrl(audioKey)
  const aws = getAwsClient()
  const signed = await aws.sign(url, { method: 'DELETE' })
  const response = await fetch(signed)
  if (!response.ok && response.status !== 404) {
    throw new Error(`R2 delete failed (${response.status})`)
  }
}
