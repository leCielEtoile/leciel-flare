/**
 * 認証・認可チェックユーティリティ
 */

import type { H3Event } from 'h3'
import { validateSession } from './session'

/**
 * 認証済みユーザーセッションを要求
 * 未認証の場合は401エラーを返す
 */
export async function requireAuth(event: H3Event) {
  const session = await getUserSession(event)

  if (!session || !session.user) {
    throw createError({
      statusCode: 401,
      message: 'Authentication required'
    })
  }

  return session
}

/**
 * 指定されたDiscordサーバーへの参加を確認
 * サーバーに参加していない場合は403エラーを返す
 */
export async function requireGuildMembership(event: H3Event) {
  const config = useRuntimeConfig()
  const requiredGuildId = config.discordGuildId

  // ギルドIDが設定されていない場合は認証のみチェック
  if (!requiredGuildId) {
    return await requireAuth(event)
  }

  // セッションを確認
  const session = await requireAuth(event)
  const sessionId = getCookie(event, 'session_id')

  if (!sessionId) {
    throw createError({
      statusCode: 401,
      message: 'Session not found'
    })
  }

  // KVからセッションデータを取得
  const sessionData = await getSessionFromKV(event, sessionId)

  if (!sessionData) {
    throw createError({
      statusCode: 401,
      message: 'Invalid session'
    })
  }

  // セッションの有効期限を検証（必要に応じて自動更新）
  const validationResult = await validateSession(event, sessionId, sessionData, true)

  if (!validationResult.valid) {
    throw createError({
      statusCode: 401,
      message: 'Session expired. Please log in again.'
    })
  }

  // セッションが更新された場合は新しいデータを使用
  const currentSessionData = validationResult.sessionData || sessionData

  // ギルドメンバーシップを確認
  if (!currentSessionData.guilds.includes(requiredGuildId)) {
    throw createError({
      statusCode: 403,
      message: 'Access denied: You must be a member of the required Discord server'
    })
  }

  return session
}
