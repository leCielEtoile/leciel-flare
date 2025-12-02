/**
 * ファイルアップロードAPI
 * POST /api/upload
 *
 * フォームデータからファイルを受け取りR2にアップロード
 * 認証必須
 */
import { handleApiError, createApiError } from '../utils/error'
import { ERROR_CODES } from '../types/error'
import {
  sanitizePath,
  sanitizeFileName,
  isAllowedMimeType,
  isValidFileSize,
  formatFileSize
} from '../utils/validation'
import { UPLOAD_CONSTANTS } from '../config/constants'
import { logger } from '../utils/logger'

export default defineEventHandler(async (event) => {
  const requestId = logger.getRequestId(event)

  // 認証・認可チェック
  await requireGuildMembership(event)

  try {
    const { MY_BUCKET, UPLOAD_METADATA } = event.context.cloudflare.env

    // フォームデータ解析
    const formData = await readFormData(event)
    const file = formData.get('file') as File
    const rawPath = (formData.get('path') as string) || ''
    const targetPath = sanitizePath(rawPath)

    if (!file) {
      throw createApiError(400, 'ファイルが指定されていません', ERROR_CODES.MISSING_PARAMETER)
    }

    // 環境変数から最大ファイルサイズを取得（指定がなければデフォルト値を使用）
    const maxFileSize = event.context.cloudflare.env.MAX_UPLOAD_SIZE
      ? Number(event.context.cloudflare.env.MAX_UPLOAD_SIZE)
      : UPLOAD_CONSTANTS.DEFAULT_MAX_FILE_SIZE

    // ファイルサイズ検証
    if (!isValidFileSize(file.size, maxFileSize)) {
      throw createApiError(
        413,
        `ファイルサイズが制限を超えています。最大サイズ: ${formatFileSize(maxFileSize)}、アップロードされたファイル: ${formatFileSize(file.size)}`,
        ERROR_CODES.FILE_TOO_LARGE,
        { maxSize: maxFileSize, uploadedSize: file.size }
      )
    }

    // MIMEタイプ検証
    const mimeType = file.type || 'application/octet-stream'
    if (!isAllowedMimeType(mimeType)) {
      throw createApiError(
        415,
        `このファイル形式（${mimeType}）はアップロードできません。許可されている形式: 画像、動画、音声、PDF、テキスト、ZIP`,
        ERROR_CODES.INVALID_MIME_TYPE,
        { mimeType }
      )
    }

    // ファイル名のサニタイズ
    const sanitizedFileName = sanitizeFileName(file.name)
    if (!sanitizedFileName) {
      throw createApiError(400, 'ファイル名が無効です', ERROR_CODES.INVALID_FILE_NAME)
    }

    // フルパス生成
    const fullPath = targetPath ? `${targetPath}/${sanitizedFileName}` : sanitizedFileName
    const uploadedAt = new Date().toISOString()

    logger.info('Upload', 'ファイルアップロード開始', {
      fileName: sanitizedFileName,
      fullPath,
      fileSize: file.size,
      mimeType
    }, requestId)

    // R2にアップロード
    const arrayBuffer = await file.arrayBuffer()

    await MY_BUCKET.put(fullPath, arrayBuffer, {
      httpMetadata: {
        contentType: mimeType
      },
      customMetadata: {
        uploadedAt,
        originalName: sanitizedFileName,
        size: file.size.toString()
      }
    })

    // アップロード確認
    const headResult = await MY_BUCKET.head(fullPath)
    if (!headResult) {
      throw createApiError(500, 'ファイルのアップロードに失敗しました（確認エラー）', ERROR_CODES.UPLOAD_FAILED)
    }

    // メタデータ保存 (KV)
    if (UPLOAD_METADATA) {
      await UPLOAD_METADATA.put(fullPath, JSON.stringify({
        name: sanitizedFileName,
        size: file.size,
        type: mimeType,
        uploadedAt
      }))
    }

    logger.info('Upload', 'ファイルアップロード完了', {
      fileName: sanitizedFileName,
      fullPath,
      fileSize: file.size
    }, requestId)

    return {
      success: true,
      message: 'ファイルが正常にアップロードされました',
      file: {
        name: sanitizedFileName,
        path: fullPath,
        size: file.size
      }
    }
  } catch (error) {
    handleApiError(error, 'Upload')
  }
})
