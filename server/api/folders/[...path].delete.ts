/**
 * フォルダ削除API
 * DELETE /api/folders/{path}
 *
 * 指定されたパスのフォルダとその中身を再帰的にR2から削除
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
    const folderPath = sanitizePath(rawPath)

    if (!folderPath) {
      throw createApiError(400, 'フォルダパスが指定されていません', ERROR_CODES.MISSING_PARAMETER)
    }

    // パスの正規化（末尾にスラッシュを追加）
    const normalizedPath = folderPath.endsWith('/') ? folderPath : `${folderPath}/`

    logger.info('FolderDelete', 'フォルダ削除開始', { folderPath: normalizedPath }, requestId)

    // フォルダ内の全オブジェクトを取得
    const objects = await MY_BUCKET.list({
      prefix: normalizedPath
    })

    if (!objects.objects || objects.objects.length === 0) {
      // .keep ファイルのみが存在する可能性もあるのでチェック
      const keepFile = await MY_BUCKET.head(`${normalizedPath}.keep`)
      if (!keepFile) {
        throw createApiError(404, 'フォルダが見つかりません', ERROR_CODES.FOLDER_NOT_FOUND)
      }
    }

    // 削除するオブジェクトのリスト
    const objectsToDelete: string[] = []

    // プレフィックスに一致するすべてのオブジェクトを収集
    if (objects.objects && objects.objects.length > 0) {
      for (const obj of objects.objects) {
        objectsToDelete.push(obj.key)
      }
    }

    // .keep ファイルも削除対象に追加
    const keepFilePath = `${normalizedPath}.keep`
    const keepFile = await MY_BUCKET.head(keepFilePath)
    if (keepFile) {
      objectsToDelete.push(keepFilePath)
    }

    logger.debug('FolderDelete', '削除対象オブジェクト取得完了', {
      folderPath: normalizedPath,
      objectCount: objectsToDelete.length
    }, requestId)

    // 並列削除処理（バッチサイズ: 10件ずつ）
    const batchSize = 10
    let deletedCount = 0
    let failedCount = 0
    const errors: Array<{ key: string; error: string }> = []

    for (let i = 0; i < objectsToDelete.length; i += batchSize) {
      const batch = objectsToDelete.slice(i, i + batchSize)
      const batchNumber = Math.floor(i / batchSize) + 1
      const totalBatches = Math.ceil(objectsToDelete.length / batchSize)

      logger.debug('FolderDelete', 'バッチ削除処理中', {
        batchNumber,
        totalBatches,
        batchSize: batch.length
      }, requestId)

      // R2とKVの削除を並列実行
      const results = await Promise.allSettled(
        batch.map(async (key) => {
          // R2から削除
          await MY_BUCKET.delete(key)

          // メタデータも削除 (KV)
          if (UPLOAD_METADATA) {
            await UPLOAD_METADATA.delete(key)
          }

          return key
        })
      )

      // 結果を集計
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          deletedCount++
          logger.debug('FolderDelete', '削除成功', { key: result.value }, requestId)
        } else {
          failedCount++
          const key = batch[index]
          const errorMessage = result.reason instanceof Error
            ? result.reason.message
            : String(result.reason)
          errors.push({ key, error: errorMessage })
          logger.error('FolderDelete', '削除失敗', { key, error: errorMessage }, requestId)
        }
      })
    }

    logger.info('FolderDelete', 'フォルダ削除完了', {
      folderPath: normalizedPath,
      deletedCount,
      failedCount
    }, requestId)

    // 一部でも失敗した場合はエラーを含めて返す
    if (failedCount > 0) {
      return {
        success: true,
        message: `フォルダを削除しましたが、一部のファイル削除に失敗しました`,
        path: folderPath,
        deletedCount,
        failedCount,
        errors,
        partial: true
      }
    }

    return {
      success: true,
      message: 'フォルダが正常に削除されました',
      path: folderPath,
      deletedCount,
      failedCount: 0
    }
  } catch (error) {
    handleApiError(error, 'Folder Delete')
  }
})
