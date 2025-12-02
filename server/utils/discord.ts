/**
 * Discord OAuth2ユーティリティ
 */

import type { DiscordUser, DiscordGuild, DiscordTokenResponse } from '../types/auth'
import { logger } from './logger'

const DISCORD_API_BASE = 'https://discord.com/api/v10'

/**
 * 認証コードをアクセストークンに交換
 */
export async function exchangeCodeForToken(
  code: string,
  redirectUri: string
): Promise<DiscordTokenResponse> {
  const config = useRuntimeConfig()

  const params = new URLSearchParams({
    client_id: config.oauth.discord.clientId,
    client_secret: config.oauth.discord.clientSecret,
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri
  })

  logger.debug('DiscordOAuth', 'トークン交換開始', {
    redirectUri,
    clientId: config.oauth.discord.clientId,
    hasClientSecret: !!config.oauth.discord.clientSecret,
    codeLength: code.length
  })

  const response = await fetch(`${DISCORD_API_BASE}/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  })

  if (!response.ok) {
    const error = await response.text()
    logger.error('DiscordOAuth', 'トークン交換失敗', {
      status: response.status,
      statusText: response.statusText,
      error
    })
    throw new Error(`Discord token exchange failed: ${error}`)
  }

  return response.json()
}

/**
 * Discordユーザー情報を取得
 */
export async function getDiscordUser(accessToken: string): Promise<DiscordUser> {
  const response = await fetch(`${DISCORD_API_BASE}/users/@me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to fetch Discord user: ${error}`)
  }

  return response.json()
}

/**
 * ユーザーが参加しているDiscordサーバー一覧を取得
 */
export async function getDiscordGuilds(accessToken: string): Promise<DiscordGuild[]> {
  const response = await fetch(`${DISCORD_API_BASE}/users/@me/guilds`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to fetch Discord guilds: ${error}`)
  }

  return response.json()
}

/**
 * ユーザーが指定されたサーバーに参加しているか確認
 */
export async function isUserInGuild(
  accessToken: string,
  guildId: string
): Promise<boolean> {
  try {
    const guilds = await getDiscordGuilds(accessToken)
    return guilds.some(guild => guild.id === guildId)
  } catch (error) {
    logger.error('DiscordOAuth', 'サーバー参加チェック失敗', {
      guildId,
      error: error instanceof Error ? error.message : String(error)
    })
    return false
  }
}

/**
 * Discordアバター画像URLを生成
 */
export function getAvatarUrl(userId: string, avatarHash: string | null): string | null {
  if (!avatarHash) return null

  const extension = avatarHash.startsWith('a_') ? 'gif' : 'png'
  return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.${extension}?size=128`
}
