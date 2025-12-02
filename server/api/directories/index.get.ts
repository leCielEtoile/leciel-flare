import { logger } from '../../utils/logger'

/**
 * ルートディレクトリ内容取得API
 * GET /api/directories
 *
 * ルートディレクトリ内のファイル・フォルダ一覧を返す
 */
export default defineEventHandler(async (event) => {
  const requestId = logger.getRequestId(event)

  try {
    // Cloudflare R2バケットアクセス
    const { MY_BUCKET } = event.context.cloudflare.env

    logger.info('RootDirectoryList', 'ルートディレクトリ読み込み開始', {}, requestId)

    // R2オブジェクト一覧取得
    const listResponse = await MY_BUCKET.list({
      prefix: '',
      delimiter: '/',
      limit: 1000
    })

    // ファイル・フォルダ情報整形
    const items = []

    // フォルダ（delimitedPrefixes）
    if (listResponse.delimitedPrefixes) {
      for (const prefix of listResponse.delimitedPrefixes) {
        const folderName = prefix.replace('/', '')
        if (folderName && folderName !== '.keep') {
          items.push({
            name: folderName,
            path: prefix,
            type: 'folder'
          })
        }
      }
    }

    // ファイル（objects）
    for (const obj of listResponse.objects) {
      const fileName = obj.key
      // .keepファイルは除外し、ディレクトリ直下のファイルのみ
      if (fileName && !fileName.includes('/') && !fileName.endsWith('.keep')) {
        items.push({
          name: fileName,
          path: obj.key,
          type: 'file',
          size: obj.size,
          lastModified: obj.uploaded
        })
      }
    }

    const folderCount = items.filter(i => i.type === 'folder').length
    const fileCount = items.filter(i => i.type === 'file').length
    logger.info('RootDirectoryList', 'ルートディレクトリ読み込み完了', { folderCount, fileCount }, requestId)

    return items
  } catch (error) {
    logger.error('RootDirectoryList', 'ルートディレクトリ取得エラー', {
      error: error instanceof Error ? error.message : String(error)
    }, requestId)
    throw createError({
      statusCode: 500,
      message: 'ディレクトリの取得に失敗しました'
    })
  }
})
