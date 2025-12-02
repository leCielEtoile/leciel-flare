/**
 * ファイル削除API
 * DELETE /api/files/{path}
 *
 * 指定されたパスのファイルをR2から削除
 * 認証必須
 */
import { handleApiError, createApiError } from '../../utils/error'
import { ERROR_CODES } from '../../types/error'
import { sanitizePath } from '../../utils/validation'
import { logger } from '../../utils/logger'

export default defineEventHandler(async (event) => {
  const requestId = logger.getRequestId(event)

  // 認証・認可チェック
  await requireGuildMembership(event)

  try {
    const { MY_BUCKET, UPLOAD_METADATA } = event.context.cloudflare.env

    // パスパラメータ取得
    const params = event.context.params?.path
    const rawPath = Array.isArray(params) ? params.join('/') : params || ''
    const filePath = sanitizePath(rawPath)

    if (!filePath) {
      throw createApiError(400, 'ファイルパスが指定されていません', ERROR_CODES.MISSING_PARAMETER)
    }

    logger.info('FileDelete', 'ファイル削除開始', { filePath }, requestId)

    // R2からファイルを取得して存在確認
    const object = await MY_BUCKET.head(filePath)
    if (!object) {
      throw createApiError(404, 'ファイルが見つかりません', ERROR_CODES.FILE_NOT_FOUND)
    }

    // R2からファイルを削除
    await MY_BUCKET.delete(filePath)

    // メタデータも削除 (KV)
    if (UPLOAD_METADATA) {
      await UPLOAD_METADATA.delete(filePath)
    }

    logger.info('FileDelete', 'ファイル削除完了', { filePath }, requestId)

    return {
      success: true,
      message: 'ファイルが正常に削除されました',
      path: filePath
    }
  } catch (error) {
    handleApiError(error, 'File Delete')
  }
})
