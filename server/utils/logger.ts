/**
 * 構造化ロギングユーティリティ
 * Cloudflare Workers の logpush 互換フォーマット
 */
import type { H3Event } from 'h3'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogEntry {
  timestamp: string
  level: LogLevel
  context: string
  message: string
  data?: Record<string, unknown>
  requestId?: string
}

class Logger {
  private isProduction: boolean

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production'
  }

  /**
   * ログエントリを出力
   */
  private log(level: LogLevel, context: string, message: string, data?: Record<string, unknown>, requestId?: string): void {
    // 本番環境では debug ログを抑制
    if (this.isProduction && level === 'debug') {
      return
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      context,
      message,
    }

    if (data !== undefined) {
      entry.data = data
    }

    if (requestId) {
      entry.requestId = requestId
    }

    // 構造化JSONとして出力
    const jsonOutput = JSON.stringify(entry)

    // レベルに応じて適切なコンソールメソッドを使用
    switch (level) {
      case 'debug':
        console.debug(jsonOutput)
        break
      case 'info':
        console.info(jsonOutput)
        break
      case 'warn':
        console.warn(jsonOutput)
        break
      case 'error':
        console.error(jsonOutput)
        break
    }
  }

  /**
   * DEBUGレベルのログ
   */
  debug(context: string, message: string, data?: Record<string, unknown>, requestId?: string): void {
    this.log('debug', context, message, data, requestId)
  }

  /**
   * INFOレベルのログ
   */
  info(context: string, message: string, data?: Record<string, unknown>, requestId?: string): void {
    this.log('info', context, message, data, requestId)
  }

  /**
   * WARNレベルのログ
   */
  warn(context: string, message: string, data?: Record<string, unknown>, requestId?: string): void {
    this.log('warn', context, message, data, requestId)
  }

  /**
   * ERRORレベルのログ
   */
  error(context: string, message: string, data?: Record<string, unknown>, requestId?: string): void {
    this.log('error', context, message, data, requestId)
  }

  /**
   * H3 Event から requestId を抽出するヘルパー
   */
  getRequestId(event: H3Event): string | undefined {
    try {
      return event?.context?.requestId || event?.node?.req?.headers?.['x-request-id']
    } catch {
      return undefined
    }
  }
}

// シングルトンインスタンスをエクスポート
export const logger = new Logger()
