/**
 * 共通エラーハンドリングユーティリティ
 */
import type { ApiError, ErrorCode } from '../types/error'
import { ERROR_CODES } from '../types/error'
import { logger } from './logger'

/**
 * APIエラーを処理する
 * 既知のエラー（statusCode付き）はそのままthrow、未知のエラーは500エラーに変換
 * @param error - 発生したエラー
 * @param context - エラーコンテキスト（ログ用）
 */
export function handleApiError(error: unknown, context?: string): never {
  const isDevelopment = import.meta.dev

  // H3エラー（statusCode付き）の場合はそのままthrow
  if (error && typeof error === 'object' && 'statusCode' in error) {
    if (isDevelopment && context) {
      logger.error(context, '既知のエラー', {
        statusCode: (error as any).statusCode,
        message: (error as any).message
      })
    } else if (context) {
      logger.error(context, 'エラー発生', {})
    }
    throw error
  }

  // 未知のエラーの場合
  const errorMessage = error instanceof Error ? error.message : String(error)
  if (isDevelopment) {
    logger.error(context || 'API', '予期しないエラー', { error: errorMessage })
  } else {
    logger.error(context || 'API', 'Internal server error', {})
  }

  // 500エラーとして返す
  throw createError({
    statusCode: 500,
    statusMessage: 'Internal Server Error',
    message: isDevelopment && error instanceof Error ? error.message : 'An unexpected error occurred',
    data: { code: ERROR_CODES.INTERNAL_ERROR }
  })
}

/**
 * エラーコード付きのAPIエラーを作成
 * @param statusCode - HTTPステータスコード
 * @param message - エラーメッセージ
 * @param code - エラーコード
 * @param details - 追加の詳細情報
 */
export function createApiError(
  statusCode: number,
  message: string,
  code: ErrorCode,
  details?: unknown
) {
  return createError({
    statusCode,
    statusMessage: getStatusMessage(statusCode),
    message,
    data: {
      code,
      ...(details && { details })
    }
  })
}

/**
 * HTTPステータスコードから標準的なステータスメッセージを取得
 */
function getStatusMessage(statusCode: number): string {
  const messages: Record<number, string> = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    409: 'Conflict',
    413: 'Payload Too Large',
    415: 'Unsupported Media Type',
    500: 'Internal Server Error'
  }
  return messages[statusCode] || 'Error'
}
