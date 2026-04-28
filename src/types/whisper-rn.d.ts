declare module 'whisper.rn' {
  import type {
    TranscribeFileOptions,
    TranscribeResult,
    ContextOptions,
  } from 'whisper.rn/lib/typescript/index'

  export class WhisperContext {
    transcribe(
      filePathOrBase64: string | number,
      options?: TranscribeFileOptions
    ): {
      stop: () => Promise<void>
      promise: Promise<TranscribeResult>
    }
    release(): Promise<void>
  }

  export function initWhisper(options: ContextOptions): Promise<WhisperContext>
  export function releaseAllWhisper(): Promise<void>

  export type { TranscribeFileOptions, TranscribeResult, ContextOptions }
}
