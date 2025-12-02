/**
 * フォルダ作成API
 * POST /api/folders/{path}
 */
import { handleApiError, createApiError } from '../../utils/error'
import { ERROR_CODES } from '../../types/error'
import { logger } from '../../utils/logger'

export default defineEventHandler(async (event) => {
  const requestId = logger.getRequestId(event)

  // 認証チェック
  await requireGuildMembership(event)

  try {
    const { MY_BUCKET, UPLOAD_METADATA } = event.context.cloudflare.env

    // パスパラメータ取得
    const params = event.context.params?.path
    const folderPath = Array.isArray(params) ? params.join('/') : params || ''

    // フォルダ名のバリデーション
    if (!folderPath || folderPath.trim() === '') {
      throw createApiError(400, 'フォルダ名を入力してください', ERROR_CODES.MISSING_PARAMETER)
    }

    // 不正な文字チェック
    if (folderPath.includes('..') || folderPath.startsWith('/')) {
      throw createApiError(400, '不正なフォルダ名です', ERROR_CODES.INVALID_FOLDER_NAME)
    }

    // R2ではフォルダは実際のオブジェクトとして存在しないが、
    // .keepファイルを作成してフォルダの存在を示す
    const keepFilePath = folderPath.endsWith('/') ? `${folderPath}.keep` : `${folderPath}/.keep`

    // .keepファイルが既に存在するか確認
    const existing = await MY_BUCKET.head(keepFilePath)
    if (existing) {
      throw createApiError(409, 'このフォルダは既に存在します', ERROR_CODES.FOLDER_ALREADY_EXISTS)
    }

    // .keepファイルを作成
    await MY_BUCKET.put(keepFilePath, new Uint8Array(0), {
      httpMetadata: {
        contentType: 'application/octet-stream'
      }
    })

    // メタデータをKVに保存
    if (UPLOAD_METADATA) {
      await UPLOAD_METADATA.put(keepFilePath, JSON.stringify({
        type: 'folder',
        createdAt: Date.now(),
        size: 0
      }))
    }

    logger.info('FolderCreate', 'フォルダ作成成功', {
      folderPath,
      keepFilePath
    }, requestId)

    return {
      success: true,
      message: 'フォルダが正常に作成されました',
      path: folderPath
    }
  } catch (error) {
    handleApiError(error, 'Folder Create')
  }
})
