/**
 * ログアウトエンドポイント
 * POST /api/auth/logout
 */
import { handleApiError } from '../../utils/error'
import { AUTH_CONSTANTS } from '../../config/constants'

export default defineEventHandler(async (event) => {
  try {
    // セッションIDを取得
    const sessionId = getCookie(event, AUTH_CONSTANTS.SESSION_COOKIE_NAME)

    if (sessionId) {
      // KVからセッションを削除
      await deleteSessionFromKV(event, sessionId)
    }

    // nuxt-auth-utilsのセッションをクリア
    await clearUserSession(event)

    // Cookieを削除
    deleteCookie(event, AUTH_CONSTANTS.SESSION_COOKIE_NAME)

    return {
      success: true,
      message: 'Logged out successfully'
    }
  } catch (error) {
    handleApiError(error, 'Logout')
  }
})
