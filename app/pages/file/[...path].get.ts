/**
 * ファイル直リンクエンドポイント
 * /file/{path} でファイルを直接返す
 */

export default defineEventHandler(async (event) => {
  const path = getRouterParam(event, 'path')

  if (!path) {
    throw createError({
      statusCode: 400,
      message: 'File path is required'
    })
  }

  // APIを使ってファイル情報を取得
  const config = useRuntimeConfig()
  const baseURL = config.public.baseURL || ''

  try {
    // ファイル情報を取得
    const fileInfo = await $fetch(`${baseURL}/api/files/${path}`, {
      headers: getHeaders(event)
    })

    if (!fileInfo || !fileInfo.file || !fileInfo.file.url) {
      throw createError({
        statusCode: 404,
        message: 'File not found'
      })
    }

    // ファイルのURLにリダイレクト
    return sendRedirect(event, fileInfo.file.url, 302)
  } catch (error) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to fetch file'
    })
  }
})
