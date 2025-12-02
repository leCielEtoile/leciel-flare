/**
 * Discord OAuth2認証開始エンドポイント
 * GET /api/auth/discord
 */

import { AUTH_CONSTANTS } from '../../config/constants'
import { logger } from '../../utils/logger'

export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  const requestId = logger.getRequestId(event)

  const redirectUri = `${config.public.siteUrl || 'http://localhost:3000'}/api/auth/discord/callback`

  logger.info('DiscordOAuth', '認証フロー開始', {
    clientId: config.oauth.discord.clientId,
    redirectUri,
    siteUrl: config.public.siteUrl
  }, requestId)

  // OAuth2認証URL生成
  const authUrl = new URL('https://discord.com/oauth2/authorize')
  authUrl.searchParams.set('client_id', config.oauth.discord.clientId)
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('scope', 'identify guilds')

  // CSRF対策用のstateパラメータ
  const state = generateSessionId()
  authUrl.searchParams.set('state', state)

  // stateをcookieに保存（検証用）
  const isProduction = config.public.siteUrl?.startsWith('https://')
  setCookie(event, AUTH_CONSTANTS.OAUTH_STATE_COOKIE_NAME, state, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: AUTH_CONSTANTS.OAUTH_STATE_TTL_SECONDS
  })

  // Discord認証ページにリダイレクト
  return sendRedirect(event, authUrl.toString(), 302)
})
