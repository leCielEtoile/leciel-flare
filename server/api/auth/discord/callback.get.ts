/**
 * Discord OAuth2コールバックエンドポイント
 * GET /api/auth/discord/callback
 */

import type { SessionData } from '../../../types/auth'
import { AUTH_CONSTANTS } from '../../../config/constants'
import { handleApiError } from '../../../utils/error'
import { logger } from '../../../utils/logger'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)
  const requestId = logger.getRequestId(event)

  const code = query.code as string | undefined
  const state = query.state as string | undefined

  // エラーチェック
  if (query.error) {
    logger.error('DiscordOAuthCallback', 'OAuth認証エラー', { error: query.error }, requestId)
    return sendRedirect(event, '/?error=oauth_failed', 302)
  }

  if (!code || !state) {
    return sendRedirect(event, '/?error=invalid_request', 302)
  }

  // CSRF対策: stateを検証
  const savedState = getCookie(event, AUTH_CONSTANTS.OAUTH_STATE_COOKIE_NAME)
  if (state !== savedState) {
    logger.error('DiscordOAuthCallback', 'State検証エラー', { state, savedState }, requestId)
    return sendRedirect(event, '/?error=invalid_state', 302)
  }

  // state cookieを削除
  deleteCookie(event, AUTH_CONSTANTS.OAUTH_STATE_COOKIE_NAME)

  try {
    // 認証コードをトークンに交換
    const redirectUri = `${config.public.siteUrl || 'http://localhost:3000'}/api/auth/discord/callback`
    const tokenResponse = await exchangeCodeForToken(code, redirectUri)

    // ユーザー情報を取得
    const discordUser = await getDiscordUser(tokenResponse.access_token)

    // ユーザーが参加しているサーバー一覧を取得
    const guilds = await getDiscordGuilds(tokenResponse.access_token)
    const guildIds = guilds.map(guild => guild.id)

    // 指定されたサーバーに参加しているか確認
    const requiredGuildId = config.discordGuildId
    if (requiredGuildId && !guildIds.includes(requiredGuildId)) {
      logger.warn('DiscordOAuthCallback', '必須サーバー未参加', {
        userId: discordUser.id,
        requiredGuildId,
        userGuilds: guildIds
      }, requestId)
      return sendRedirect(event, '/?error=unauthorized_server', 302)
    }

    // セッションデータを作成
    const now = Date.now()
    const sessionId = generateSessionId()
    const sessionData: SessionData = {
      userId: `user_${discordUser.id}`,
      discordId: discordUser.id,
      username: discordUser.username,
      globalName: discordUser.global_name,
      avatar: discordUser.avatar,
      guilds: guildIds,
      createdAt: now,
      expiresAt: now + AUTH_CONSTANTS.SESSION_TTL_MS
    }

    // KVにセッションを保存
    await saveSessionToKV(event, sessionId, sessionData)

    // nuxt-auth-utilsのセッションを設定
    await setUserSession(event, sessionDataToUserSession(sessionData))

    // セッションIDをcookieに保存
    const isProduction = config.public.siteUrl?.startsWith('https://')
    setCookie(event, AUTH_CONSTANTS.SESSION_COOKIE_NAME, sessionId, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: AUTH_CONSTANTS.SESSION_TTL_SECONDS
    })

    // ディレクトリページにリダイレクト
    return sendRedirect(event, '/dir', 302)
  } catch (error) {
    handleApiError(error, 'Discord OAuth Callback')
  }
})
