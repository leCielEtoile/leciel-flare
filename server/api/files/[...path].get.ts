import { logger } from '../../utils/logger'

/**
 * ファイル情報取得API
 * GET /api/files/*
 *
 * 指定されたパスのファイル情報を返す
 */
export default defineEventHandler(async (event) => {
  const path = getRouterParam(event, 'path')
  const requestId = logger.getRequestId(event)

  if (!path) {
    throw createError({
      statusCode: 400,
      message: 'ファイルパスが指定されていません'
    })
  }

  try {
    const { MY_BUCKET } = event.context.cloudflare.env
    const object = await MY_BUCKET.get(path)

    if (!object) {
      throw createError({
        statusCode: 404,
        message: 'ファイルが見つかりません'
      })
    }

    return {
      success: true,
      file: {
        name: path.split('/').pop(),
        path,
        size: object.size,
        lastModified: object.uploaded,
        etag: object.etag,
        contentType: object.httpMetadata?.contentType,
        url: `/${path}`
      }
    }
  } catch (error) {
    logger.error('FileGet', 'ファイル取得エラー', {
      filePath: path,
      error: error instanceof Error ? error.message : String(error)
    }, requestId)

    if ((error as any).statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'ファイルの取得に失敗しました'
    })
  }
})
