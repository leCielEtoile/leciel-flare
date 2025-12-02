/**
 * 開発モード専用のテストログインエンドポイント
 * POST /api/auth/dev-login
 *
 * 本番環境では無効化されます
 */

import { logger } from '../../utils/logger'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const requestId = logger.getRequestId(event)

  // 本番環境では無効化
  const isDevelopment = process.dev || !config.public.siteUrl?.startsWith('https://')

  if (!isDevelopment) {
    throw createError({
      statusCode: 403,
      message: 'Dev login is only available in development mode'
    })
  }

  // テストユーザーのセッションを作成
  const testUser = {
    id: 'dev-user-001',
    discordId: '000000000000000000',
    username: 'testuser',
    displayName: 'Test User',
    avatar: null
  }

  await setUserSession(event, {
    user: testUser,
    loggedInAt: Date.now()
  })

  logger.info('DevLogin', 'テストユーザーでログイン', { userId: testUser.id, username: testUser.username }, requestId)

  return {
    success: true,
    user: testUser
  }
})
