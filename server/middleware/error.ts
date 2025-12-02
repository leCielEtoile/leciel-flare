/**
 * グローバルエラーハンドリングミドルウェア
 *
 * すべてのAPIエンドポイントで発生するエラーを一貫した形式で処理
 * エラーレスポンスの形式を統一し、適切なログを出力
 */
import type { H3Error } from 'h3'
import type { ApiError } from '../types/error'
import { ERROR_CODES } from '../types/error'
import { logger } from '../utils/logger'

export default defineEventHandler((event) => {
  // エラーハンドリング用のフック
  // Nuxt/H3では、エラーは自動的に処理されるため、
  // ここでは主にログ出力とレスポンス形式の統一を行う

  // レスポンスフックでエラーレスポンスをインターセプト
  event.node.res.on('finish', () => {
    const statusCode = event.node.res.statusCode

    // エラーレスポンスの場合のみログ出力
    if (statusCode >= 400) {
      const isDevelopment = import.meta.dev
      const method = event.method
      const path = event.path
      const requestId = logger.getRequestId(event)

      if (isDevelopment) {
        logger.error('ErrorMiddleware', 'エラーレスポンス', {
          method,
          path,
          statusCode
        }, requestId)
      }
    }
  })
})
