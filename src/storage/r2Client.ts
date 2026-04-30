import './cryptoPolyfill'
import Constants from 'expo-constants'
import { AwsClient } from 'aws4fetch'

interface R2Config {
  accountId: string
  accessKeyId: string
  secretAccessKey: string
  bucket: string
}

let cachedConfig: R2Config | null = null
let cachedClient: AwsClient | null = null

function getConfig(): R2Config {
  if (cachedConfig) return cachedConfig
  const extra = Constants.expoConfig?.extra as Record<string, string | undefined> | undefined
  const accountId = extra?.r2AccountId
  const accessKeyId = extra?.r2AccessKeyId
  const secretAccessKey = extra?.r2SecretAccessKey
  const bucket = extra?.r2Bucket
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
    throw new Error('R2 config missing — check .env and app.config.js extra block')
  }
  cachedConfig = { accountId, accessKeyId, secretAccessKey, bucket }
  return cachedConfig
}

export function getAwsClient(): AwsClient {
  if (cachedClient) return cachedClient
  const { accessKeyId, secretAccessKey } = getConfig()
  cachedClient = new AwsClient({
    accessKeyId,
    secretAccessKey,
    service: 's3',
    region: 'auto',
  })
  return cachedClient
}

export function getObjectUrl(key: string): string {
  const { accountId, bucket } = getConfig()
  return `https://${accountId}.r2.cloudflarestorage.com/${bucket}/${encodeURI(key)}`
}
