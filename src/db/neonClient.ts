import { neon } from '@neondatabase/serverless'
import type { NeonQueryFunction } from '@neondatabase/serverless'

let sql: NeonQueryFunction<false, false> | null = null

export function initializeNeonClient(connectionString: string): void {
  sql = neon(connectionString)
}

export function getNeonClient(): NeonQueryFunction<false, false> {
  if (!sql) throw new Error('Neon client not initialized')
  return sql
}
