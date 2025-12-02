/**
 * Nitro プラグイン：グローバルエラーハンドラー
 *
 * すべてのエラーレスポンスを一貫した形式に変換
 */
import type { NitroApp } from 'nitropack'
import type { H3Error } from 'h3'
import { logger } from '../utils/logger'

export default defineNitroPlugin((nitroApp: NitroApp) => {
  nitroApp.hooks.hook('error', (error, { event }) => {
    const isDevelopment = import.meta.dev
    const requestId = event ? logger.getRequestId(event) : undefined

    // エラー情報をログ出力
    if (isDevelopment) {
      logger.error('NitroErrorHandler', 'エラー発生', {
        path: event?.path,
        method: event?.method,
        statusCode: (error as H3Error).statusCode || 500,
        message: error.message,
        stack: error.stack
      }, requestId)
    } else {
      logger.error('NitroErrorHandler', 'エラー発生', {
        path: event?.path,
        method: event?.method,
        statusCode: (error as H3Error).statusCode || 500
      }, requestId)
    }
  })

  nitroApp.hooks.hook('render:response', (response, { event }) => {
    // エラーレスポンスの場合、data.code が含まれていることを確認
    // すでに createApiError または handleApiError によって処理されている場合は何もしない
  })
})
