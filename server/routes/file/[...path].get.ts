/**
 * ファイル直リンクエンドポイント
 * /file/{path} でファイルを直接R2から返す
 */

import { handleApiError } from '../../utils/error'
import { sanitizePath } from '../../utils/validation'

export default defineEventHandler(async (event) => {
  const pathParam = getRouterParam(event, 'path')

  if (!pathParam) {
    throw createError({
      statusCode: 400,
      message: 'File path is required'
    })
  }

  const rawPath = Array.isArray(pathParam) ? pathParam.join('/') : pathParam
  const path = sanitizePath(rawPath)

  try {
    // Cloudflare R2バケットにアクセス
    const bucket = event.context.cloudflare?.env?.MY_BUCKET

    if (!bucket) {
      throw createError({
        statusCode: 500,
        message: 'R2 bucket not configured'
      })
    }

    // R2からファイルを取得
    const object = await bucket.get(path)

    if (!object) {
      throw createError({
        statusCode: 404,
        message: 'File not found'
      })
    }

    // Content-Typeを設定
    const headers = new Headers()
    if (object.httpMetadata?.contentType) {
      headers.set('Content-Type', object.httpMetadata.contentType)
    }

    // キャッシュヘッダーを設定
    headers.set('Cache-Control', 'public, max-age=31536000, immutable')

    // Content-Dispositionを設定（ファイル名を保持）
    const fileName = path.split('/').pop() || 'download'
    headers.set('Content-Disposition', `inline; filename="${fileName}"`)

    // ファイルの内容を返す
    return new Response(object.body, {
      headers,
      status: 200
    })
  } catch (error) {
    handleApiError(error, 'File Fetch')
  }
})
